// ==========================================
// ORBITAL HUD WIDGET (ADAPTIVE THEME)
// Created by [Your Name]
// ==========================================

async function createWidget() {
  const w = new ListWidget();
  
  // 1. THEME DETECTION
  // We check if the device is in Dark Mode
  const isDark = Device.isUsingDarkAppearance();
  
  // 2. DEFINE COLORS BASED ON THEME
  const colors = {
    bgTop: isDark ? new Color("#1c1c1e") : new Color("#ffffff"),
    bgBot: isDark ? new Color("#000000") : new Color("#d1d1d6"),
    textPrimary: isDark ? Color.white() : Color.black(),
    textSecondary: isDark ? Color.gray() : new Color("#6e6e73"),
    trackOpacity: isDark ? 0.15 : 0.08, // Lighter tracks for light mode
  };

  // 3. BACKGROUND GRADIENT
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [colors.bgTop, colors.bgBot];
  w.backgroundGradient = gradient;

  // 4. LAYOUT SETUP
  const mainStack = w.addStack();
  mainStack.layoutHorizontally();
  mainStack.centerAlignContent();
  
  // --- LEFT: THE RINGS ---
  const ringStack = mainStack.addStack();
  ringStack.centerAlignContent();
  
  // Battery Logic
  const batLevel = Device.batteryLevel();
  let batColor = "#32D74B"; // Green
  if (batLevel < 0.2) batColor = "#FF453A"; // Red
  else if (batLevel < 0.5) batColor = "#FFD60A"; // Yellow

  // DATA POINTS
  const dataPoints = [
    { label: "YEAR",  val: getYearProgress(),  color: "#FF2D55", icon: "calendar" },
    { label: "MONTH", val: getMonthProgress(), color: "#BF5AF2", icon: "calendar.circle" },
    { label: "DAY",   val: getDayProgress(),   color: "#0A84FF", icon: "sun.max.fill" },
    { label: "POWER", val: batLevel,           color: batColor,  icon: "bolt.fill" }
  ];

  // Draw Rings with Theme Colors
  const ringImg = drawHighResRings(dataPoints, colors.trackOpacity);
  ringStack.addImage(ringImg);
  
  mainStack.addSpacer(25);
  
  // --- RIGHT: DATA DASHBOARD ---
  const infoStack = mainStack.addStack();
  infoStack.layoutVertically();
  infoStack.centerAlignContent();

  dataPoints.forEach(item => {
    const row = infoStack.addStack();
    row.layoutHorizontally();
    row.centerAlignContent();
    
    // Icon
    const icon = SFSymbol.named(item.icon);
    icon.applyFont(Font.systemFont(12));
    const img = row.addImage(icon.image);
    img.imageSize = new Size(12, 12);
    img.tintColor = new Color(item.color);
    
    row.addSpacer(8);
    
    // Label
    const lbl = row.addText(item.label);
    lbl.font = Font.systemFont(10);
    lbl.textColor = colors.textSecondary;
    
    row.addSpacer(8);
    
    // Value
    const pct = Math.round(item.val * 100) + "%";
    const valText = row.addText(pct);
    valText.font = new Font("Menlo-Bold", 12); 
    valText.textColor = colors.textPrimary;
    
    infoStack.addSpacer(5); 
  });

  return w;
}

// ==========================================
// RENDER ENGINE
// ==========================================
function drawHighResRings(items, trackOpacity) {
  const size = 400;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  
  const center = new Point(size/2, size/2);
  const maxRadius = 170;
  const stroke = 26;
  const gap = 18;
  
  items.forEach((item, i) => {
    const r = maxRadius - (i * (stroke + gap));
    const color = new Color(item.color);
    
    // Track (Background)
    ctx.setStrokeColor(new Color(item.color, trackOpacity));
    ctx.setLineWidth(stroke);
    const trackPath = new Path();
    trackPath.addEllipse(new Rect(center.x - r, center.y - r, r*2, r*2));
    ctx.addPath(trackPath);
    ctx.strokePath();
    
    // Progress (Foreground)
    if (item.val > 0.01) { 
      drawArc(ctx, center, r, stroke, item.val, color);
    }
  });
  
  return ctx.getImage();
}

function drawArc(ctx, center, radius, width, pct, color) {
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * pct);
  const step = 0.02;
  
  const p = new Path();
  let first = true;
  
  for (let a = startAngle; a <= endAngle; a += step) {
    let x = center.x + radius * Math.cos(a);
    let y = center.y + radius * Math.sin(a);
    if (first) { p.move(new Point(x,y)); first = false; }
    else { p.addLine(new Point(x,y)); }
  }
  
  let finalX = center.x + radius * Math.cos(endAngle);
  let finalY = center.y + radius * Math.sin(endAngle);
  p.addLine(new Point(finalX, finalY));
  
  ctx.addPath(p);
  ctx.setStrokeColor(color);
  ctx.setLineWidth(width);
  ctx.strokePath();
}

// ==========================================
// CALCULATIONS
// ==========================================
function getYearProgress() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const end = new Date(now.getFullYear() + 1, 0, 1);
  return (now - start) / (end - start);
}
function getMonthProgress() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return (now - start) / (end - start);
}
function getDayProgress() {
  const now = new Date();
  const start = new Date(); start.setHours(0,0,0,0);
  const end = new Date(); end.setHours(23,59,59,999);
  return (now - start) / (end - start);
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
