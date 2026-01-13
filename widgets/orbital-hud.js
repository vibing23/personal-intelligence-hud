// ==========================================
// CONFIGURATION & COLORS
// ==========================================
const BG_GRADIENT_TOP = new Color("#1c1c1e");
const BG_GRADIENT_BOT = new Color("#000000");

// The "Glow" intensity (0.0 - 1.0)
const TRACK_OPACITY = 0.15;

// Productivity tracking
const DAILY_FOCUS_GOAL = 6; // 6 hours of deep work goal
const FOCUS_DATA_KEY = "focus_hours_data";

async function createWidget() {
  const w = new ListWidget();
  
  // 1. PREMIUM BACKGROUND GRADIENT
  const gradient = new LinearGradient();
  gradient.locations = [0, 1];
  gradient.colors = [BG_GRADIENT_TOP, BG_GRADIENT_BOT];
  w.backgroundGradient = gradient;

  // 2. LAYOUT SETUP (Horizontal: Rings | Data)
  const mainStack = w.addStack();
  mainStack.layoutHorizontally();
  mainStack.centerAlignContent();
  
  // --- LEFT: THE RINGS (The Visual Hook) ---
  const ringStack = mainStack.addStack();
  ringStack.centerAlignContent();
  
  // We calculate battery color dynamically here
  const batLevel = Device.batteryLevel();
  let batColor = "#32D74B"; // Green
  if (batLevel < 0.2) batColor = "#FF453A"; // Red
  else if (batLevel < 0.5) batColor = "#FFD60A"; // Yellow

  // Get focus hours for today
  const focusHours = await getFocusHours();
  const focusProgress = Math.min(focusHours / DAILY_FOCUS_GOAL, 1.0);

  // DEFINE DATA POINTS (5 rings now!)
  const dataPoints = [
    { label: "YEAR",  val: getYearProgress(),  color: "#FF2D55", icon: "calendar" },
    { label: "MONTH", val: getMonthProgress(), color: "#BF5AF2", icon: "calendar.circle" },
    { label: "DAY",   val: getDayProgress(),   color: "#0A84FF", icon: "sun.max.fill" },
    { label: "FOCUS", val: focusProgress,      color: "#FFD60A", icon: "brain.head.profile" },
    { label: "POWER", val: batLevel,           color: batColor,  icon: "bolt.fill" }
  ];

  // Draw the high-res image
  const ringImg = drawHighResRings(dataPoints);
  ringStack.addImage(ringImg);
  
  // Spacer between Rings and Text
  mainStack.addSpacer(25);
  
  // --- RIGHT: THE DATA DASHBOARD (The info) ---
  const infoStack = mainStack.addStack();
  infoStack.layoutVertically();
  infoStack.centerAlignContent(); // Vertically center the text block

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
    
    // Label (Small, Gray, Uppercase)
    const lbl = row.addText(item.label);
    lbl.font = Font.systemFont(10);
    lbl.textColor = Color.gray();
    
    row.addSpacer(8);
    
    // Value - special handling for FOCUS
    let displayText;
    if (item.label === "FOCUS") {
      const hours = focusHours.toFixed(1);
      displayText = hours + "h";
    } else {
      displayText = Math.round(item.val * 100) + "%";
    }
    
    const valText = row.addText(displayText);
    valText.font = new Font("Menlo-Bold", 12); 
    valText.textColor = Color.white();
    
    infoStack.addSpacer(5); // Breathing room between rows
  });

  return w;
}

// ==========================================
// THE RENDERING ENGINE (4K Resolution)
// ==========================================
function drawHighResRings(items) {
  // We draw at 400x400 for Retina sharpness
  const size = 400;
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;
  
  const center = new Point(size/2, size/2);
  const maxRadius = 180;
  const stroke = 22; // Slightly thinner for 5 rings
  const gap = 14;    // Tighter gap for 5 rings
  
  items.forEach((item, i) => {
    const r = maxRadius - (i * (stroke + gap));
    const color = new Color(item.color);
    
    // 1. Draw The "Track" (Background Slot)
    ctx.setStrokeColor(new Color(item.color, TRACK_OPACITY));
    ctx.setLineWidth(stroke);
    const trackPath = new Path();
    trackPath.addEllipse(new Rect(center.x - r, center.y - r, r*2, r*2));
    ctx.addPath(trackPath);
    ctx.strokePath();
    
    // 2. Draw The "Progress" (Foreground)
    if (item.val > 0.01) { // Only draw if > 1%
      drawArc(ctx, center, r, stroke, item.val, color);
    }
  });
  
  return ctx.getImage();
}

// Helper: Draws a perfect arc
function drawArc(ctx, center, radius, width, pct, color) {
  const startAngle = -Math.PI / 2; // Start at top (12 o'clock)
  const endAngle = startAngle + (2 * Math.PI * pct);
  const step = 0.02; // High precision steps
  
  const p = new Path();
  let first = true;
  
  // Trace the arc
  for (let a = startAngle; a <= endAngle; a += step) {
    let x = center.x + radius * Math.cos(a);
    let y = center.y + radius * Math.sin(a);
    if (first) { p.move(new Point(x,y)); first = false; }
    else { p.addLine(new Point(x,y)); }
  }
  
  // Close the arc at exact endpoint
  let finalX = center.x + radius * Math.cos(endAngle);
  let finalY = center.y + radius * Math.sin(endAngle);
  p.addLine(new Point(finalX, finalY));
  
  ctx.addPath(p);
  ctx.setStrokeColor(color);
  ctx.setLineWidth(width);
  ctx.strokePath();
}

// ==========================================
// FOCUS HOURS TRACKING
// ==========================================
async function getFocusHours() {
  const fm = FileManager.iCloud();
  const path = fm.joinPath(fm.documentsDirectory(), FOCUS_DATA_KEY + ".json");
  
  const today = getTodayString();
  
  // Check if file exists
  if (!fm.fileExists(path)) {
    // Initialize
    const newData = {
      date: today,
      hours: 0
    };
    fm.writeString(path, JSON.stringify(newData));
    return 0;
  }
  
  // Load existing data
  const dataStr = fm.readString(path);
  const data = JSON.parse(dataStr);
  
  // Check if it's a new day
  if (data.date !== today) {
    // Reset for new day
    data.date = today;
    data.hours = 0;
    fm.writeString(path, JSON.stringify(data));
  }
  
  return data.hours;
}

async function addFocusHours(hoursToAdd) {
  const fm = FileManager.iCloud();
  const path = fm.joinPath(fm.documentsDirectory(), FOCUS_DATA_KEY + ".json");
  
  const today = getTodayString();
  
  let data = {
    date: today,
    hours: 0
  };
  
  if (fm.fileExists(path)) {
    const dataStr = fm.readString(path);
    data = JSON.parse(dataStr);
    
    // Reset if new day
    if (data.date !== today) {
      data.date = today;
      data.hours = 0;
    }
  }
  
  // Add hours
  data.hours += hoursToAdd;
  fm.writeString(path, JSON.stringify(data));
  
  return data.hours;
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return year + "-" + month + "-" + day;
}

// ==========================================
// DATA CALCULATIONS
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

// ==========================================
// INTERACTIVE MODE (when run in app)
// ==========================================
if (config.runsInApp) {
  const alert = new Alert();
  alert.title = "Focus Hours Tracker";
  alert.message = "Log your focus session";
  alert.addAction("Log 2 Hours");
  alert.addAction("Log 1 Hour");
  alert.addAction("Log 30 Minutes");
  alert.addCancelAction("Cancel");
  
  const response = await alert.presentAlert();
  
  if (response === 0) {
    await addFocusHours(2);
    const notify = new Notification();
    notify.title = "🧠 Focus Logged!";
    notify.body = "Added 2 hours to today's total";
    notify.schedule();
  } else if (response === 1) {
    await addFocusHours(1);
    const notify = new Notification();
    notify.title = "🧠 Focus Logged!";
    notify.body = "Added 1 hour to today's total";
    notify.schedule();
  } else if (response === 2) {
    await addFocusHours(0.5);
    const notify = new Notification();
    notify.title = "🧠 Focus Logged!";
    notify.body = "Added 30 minutes to today's total";
    notify.schedule();
  }
}

// Run the widget
const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
