// ==========================================
// ENERGY OPTIMIZER - PEAK PERFORMANCE WIDGET
// ==========================================

// CONFIGURATION
const BG_GRADIENT_TOP = new Color("#0f0f23");
const BG_GRADIENT_BOT = new Color("#1a0f2e");

// Energy score thresholds
const PEAK_THRESHOLD = 0.8;
const HIGH_THRESHOLD = 0.6;
const MEDIUM_THRESHOLD = 0.4;

async function createWidget() {
  const w = new ListWidget();
  
  // Premium gradient background
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [BG_GRADIENT_TOP, BG_GRADIENT_BOT];
  w.backgroundGradient = gradient;
  
  w.setPadding(16, 16, 16, 16);
  
  // Calculate current energy and peak window
  const now = new Date();
  const currentEnergy = calculateEnergyScore(now);
  const peakWindow = findPeakWindow(now);
  const isPeakTime = isInPeakWindow(now, peakWindow);
  
  // HEADER - Energy Status
  const header = w.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();
  
  const statusIcon = SFSymbol.named(isPeakTime ? "bolt.fill" : "brain.head.profile");
  statusIcon.applyFont(Font.systemFont(14));
  const iconImg = header.addImage(statusIcon.image);
  iconImg.imageSize = new Size(14, 14);
  iconImg.tintColor = isPeakTime ? new Color("#FFD60A") : new Color("#00d4ff");
  
  header.addSpacer(8);
  
  const title = header.addText(isPeakTime ? "⚡ PEAK HOURS" : "ENERGY OPTIMIZER");
  title.font = new Font("Menlo-Bold", 12);
  title.textColor = Color.white();
  
  header.addSpacer();
  
  const time = header.addText(formatTime(now));
  time.font = Font.systemFont(10);
  time.textColor = Color.gray();
  
  w.addSpacer(14);
  
  // MAIN VISUAL - Energy Timeline
  const timelineImg = drawEnergyTimeline(now, peakWindow);
  const imgView = w.addImage(timelineImg);
  imgView.centerAlignImage();
  
  w.addSpacer(14);
  
  // PEAK WINDOW CALLOUT
  const peakStack = w.addStack();
  peakStack.layoutVertically();
  peakStack.centerAlignContent();
  
  if (isPeakTime) {
    // Currently in peak window
    const peakLabel = peakStack.addText("YOU'RE IN THE ZONE");
    peakLabel.font = new Font("Menlo-Bold", 11);
    peakLabel.textColor = new Color("#FFD60A");
    peakLabel.centerAlignText();
    
    peakStack.addSpacer(4);
    
    const suggestion = peakStack.addText("🎯 Do your hardest work NOW");
    suggestion.font = Font.systemFont(10);
    suggestion.textColor = Color.white();
    suggestion.centerAlignText();
  } else {
    // Show upcoming peak window
    const peakLabel = peakStack.addText("YOUR PEAK WINDOW TODAY");
    peakLabel.font = Font.systemFont(9);
    peakLabel.textColor = Color.gray();
    peakLabel.centerAlignText();
    
    peakStack.addSpacer(4);
    
    const windowText = peakStack.addText(peakWindow.display);
    windowText.font = new Font("Menlo-Bold", 16);
    windowText.textColor = new Color("#FFD60A");
    windowText.centerAlignText();
    
    peakStack.addSpacer(4);
    
    const suggestion = peakStack.addText(peakWindow.suggestion);
    suggestion.font = Font.systemFont(10);
    suggestion.textColor = new Color("#00d4ff");
    suggestion.centerAlignText();
  }
  
  w.addSpacer(12);
  
  // FOOTER - Current Stats
  const footer = w.addStack();
  footer.layoutHorizontally();
  footer.centerAlignContent();
  
  // Current Energy Score
  const energyStack = footer.addStack();
  energyStack.layoutHorizontally();
  energyStack.centerAlignContent();
  
  const energyIcon = SFSymbol.named("gauge.medium");
  energyIcon.applyFont(Font.systemFont(11));
  const energyIconImg = energyStack.addImage(energyIcon.image);
  energyIconImg.imageSize = new Size(11, 11);
  energyIconImg.tintColor = getEnergyColor(currentEnergy);
  
  energyStack.addSpacer(5);
  
  const energyLabel = energyStack.addText("Energy: " + Math.round(currentEnergy * 100) + "%");
  energyLabel.font = Font.systemFont(10);
  energyLabel.textColor = Color.white();
  
  footer.addSpacer();
  
  // Focus capacity
  const focusStack = footer.addStack();
  focusStack.layoutHorizontally();
  focusStack.centerAlignContent();
  
  const focusIcon = SFSymbol.named("target");
  focusIcon.applyFont(Font.systemFont(11));
  const focusIconImg = focusStack.addImage(focusIcon.image);
  focusIconImg.imageSize = new Size(11, 11);
  focusIconImg.tintColor = new Color("#BF5AF2");
  
  focusStack.addSpacer(5);
  
  const focusLabel = focusStack.addText(getEnergyLevel(currentEnergy));
  focusLabel.font = Font.systemFont(10);
  focusLabel.textColor = Color.white();
  
  return w;
}

// ==========================================
// ENERGY TIMELINE VISUALIZATION
// ==========================================
function drawEnergyTimeline(now, peakWindow) {
  const width = 1100;
  const height = 200;
  const ctx = new DrawContext();
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  
  const padding = 60;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  const currentHour = now.getHours() + (now.getMinutes() / 60);
  
  // Draw hour markers and labels
  ctx.setTextColor(new Color("#666666"));
  ctx.setFont(Font.systemFont(9));
  
  for (let h = 6; h <= 22; h += 2) {
    const x = padding + ((h - 6) / 16) * chartWidth;
    const label = h === 12 ? "12PM" : h < 12 ? h + "AM" : (h - 12) + "PM";
    ctx.drawTextInRect(label, new Rect(x - 20, height - 30, 40, 20));
    
    // Draw vertical grid line
    ctx.setStrokeColor(new Color("#ffffff", 0.05));
    ctx.setLineWidth(1);
    const line = new Path();
    line.move(new Point(x, padding));
    line.addLine(new Point(x, height - padding));
    ctx.addPath(line);
    ctx.strokePath();
  }
  
  // Draw energy curve
  const points = [];
  for (let h = 6; h <= 22; h += 0.25) {
    const hour = h;
    const x = padding + ((hour - 6) / 16) * chartWidth;
    const energy = calculateEnergyScore(createTimeFromHour(hour));
    const y = (height - padding) - (energy * chartHeight);
    points.push({x, y, energy});
  }
  
  // Draw glow under the curve (area fill)
  const glowPath = new Path();
  glowPath.move(new Point(points[0].x, height - padding));
  
  for (let i = 0; i < points.length; i++) {
    glowPath.addLine(new Point(points[i].x, points[i].y));
  }
  
  glowPath.addLine(new Point(points[points.length - 1].x, height - padding));
  glowPath.closeSubpath();
  
  ctx.addPath(glowPath);
  const glowGradient = new Color("#00d4ff", 0.15);
  ctx.setFillColor(glowGradient);
  ctx.fillPath();
  
  // Draw the main curve line with gradient effect
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    
    const line = new Path();
    line.move(new Point(p1.x, p1.y));
    line.addLine(new Point(p2.x, p2.y));
    
    ctx.addPath(line);
    ctx.setStrokeColor(getEnergyColor(p1.energy));
    ctx.setLineWidth(4);
    ctx.strokePath();
  }
  
  // Highlight peak window with golden glow
  const peakStartX = padding + ((peakWindow.start - 6) / 16) * chartWidth;
  const peakEndX = padding + ((peakWindow.end - 6) / 16) * chartWidth;
  
  const peakRect = new Rect(peakStartX, padding - 10, peakEndX - peakStartX, chartHeight + 20);
  ctx.setFillColor(new Color("#FFD60A", 0.1));
  ctx.fillRect(peakRect);
  
  // Draw peak window border
  ctx.setStrokeColor(new Color("#FFD60A", 0.5));
  ctx.setLineWidth(2);
  ctx.strokeRect(peakRect);
  
  // Add "PEAK WINDOW" label
  ctx.setTextColor(new Color("#FFD60A"));
  ctx.setFont(new Font("Menlo-Bold", 10));
  ctx.drawTextInRect("PEAK WINDOW", new Rect(peakStartX, padding - 30, peakEndX - peakStartX, 20));
  
  // Draw current time indicator
  const currentX = padding + ((currentHour - 6) / 16) * chartWidth;
  
  if (currentHour >= 6 && currentHour <= 22) {
    // Vertical line
    ctx.setStrokeColor(new Color("#ffffff", 0.6));
    ctx.setLineWidth(2);
    const currentLine = new Path();
    currentLine.move(new Point(currentX, padding));
    currentLine.addLine(new Point(currentX, height - padding));
    ctx.addPath(currentLine);
    ctx.strokePath();
    
    // Pulsing dot at intersection
    const currentEnergy = calculateEnergyScore(now);
    const currentY = (height - padding) - (currentEnergy * chartHeight);
    
    ctx.setFillColor(new Color("#ffffff"));
    ctx.fillEllipse(new Rect(currentX - 6, currentY - 6, 12, 12));
    
    // Outer glow ring
    ctx.setStrokeColor(new Color("#00d4ff", 0.5));
    ctx.setLineWidth(3);
    ctx.strokeEllipse(new Rect(currentX - 10, currentY - 10, 20, 20));
  }
  
  return ctx.getImage();
}

// ==========================================
// ENERGY CALCULATION ENGINE
// ==========================================
function calculateEnergyScore(date) {
  const hour = date.getHours() + (date.getMinutes() / 60);
  
  // Base circadian rhythm (simplified)
  let energy = 0.5;
  
  // Morning ramp (6am-10am)
  if (hour >= 6 && hour < 10) {
    energy = 0.4 + ((hour - 6) / 4) * 0.5; // 0.4 to 0.9
  }
  // Peak performance (10am-12pm)
  else if (hour >= 10 && hour < 12) {
    energy = 0.9 + (Math.sin((hour - 10) * Math.PI) * 0.1); // Peak at 0.95-1.0
  }
  // Post-lunch dip (12pm-2pm)
  else if (hour >= 12 && hour < 14) {
    energy = 0.8 - ((hour - 12) / 2) * 0.25; // Drop to 0.55
  }
  // Afternoon recovery (2pm-4pm)
  else if (hour >= 14 && hour < 16) {
    energy = 0.55 + ((hour - 14) / 2) * 0.25; // Climb to 0.8
  }
  // Evening plateau (4pm-7pm)
  else if (hour >= 16 && hour < 19) {
    energy = 0.8 - ((hour - 16) / 3) * 0.2; // Gradual decline
  }
  // Evening decline (7pm-10pm)
  else if (hour >= 19 && hour < 22) {
    energy = 0.6 - ((hour - 19) / 3) * 0.3; // Down to 0.3
  }
  // Night (10pm-6am)
  else {
    energy = 0.2;
  }
  
  // Add slight randomness for realism
  energy += (Math.random() - 0.5) * 0.05;
  
  return Math.max(0, Math.min(1, energy));
}

function findPeakWindow(date) {
  // Peak window is typically 10am-12pm based on circadian rhythm
  const peakStart = 10;
  const peakEnd = 12;
  
  const startStr = formatHour(peakStart);
  const endStr = formatHour(peakEnd);
  
  const currentHour = date.getHours() + (date.getMinutes() / 60);
  
  let suggestion = "";
  if (currentHour < peakStart - 1) {
    suggestion = "⏰ Block this time on your calendar";
  } else if (currentHour < peakStart) {
    suggestion = "🚀 Starts in " + Math.round((peakStart - currentHour) * 60) + " minutes";
  } else if (currentHour > peakEnd) {
    suggestion = "📊 Peak window passed - review tomorrow";
  }
  
  return {
    start: peakStart,
    end: peakEnd,
    display: startStr + " - " + endStr,
    suggestion: suggestion
  };
}

function isInPeakWindow(date, peakWindow) {
  const hour = date.getHours() + (date.getMinutes() / 60);
  return hour >= peakWindow.start && hour < peakWindow.end;
}

// ==========================================
// UTILITIES
// ==========================================
function getEnergyColor(energy) {
  if (energy >= PEAK_THRESHOLD) return new Color("#FFD60A"); // Gold
  if (energy >= HIGH_THRESHOLD) return new Color("#00d4ff"); // Cyan
  if (energy >= MEDIUM_THRESHOLD) return new Color("#BF5AF2"); // Purple
  return new Color("#FF453A"); // Red
}

function getEnergyLevel(energy) {
  if (energy >= PEAK_THRESHOLD) return "Peak Performance";
  if (energy >= HIGH_THRESHOLD) return "High Focus";
  if (energy >= MEDIUM_THRESHOLD) return "Moderate";
  return "Low Energy";
}

function formatTime(date) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12;
  const finalHours = displayHours === 0 ? 12 : displayHours;
  return finalHours + ":" + minutes + " " + ampm;
}

function formatHour(hour) {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12;
  const finalHour = displayHour === 0 ? 12 : displayHour;
  
  if (m === 0) {
    return finalHour + ":00 " + ampm;
  }
  return finalHour + ":" + m.toString().padStart(2, '0') + " " + ampm;
}

function createTimeFromHour(hour) {
  const date = new Date();
  date.setHours(Math.floor(hour));
  date.setMinutes((hour % 1) * 60);
  date.setSeconds(0);
  return date;
}

// ==========================================
// RUN
// ==========================================
const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
