// ==========================================
// DAY BURNDOWN (SQUARE EDITION)
// ==========================================

const START_HOUR = 8;
const END_HOUR = 18;

async function createWidget() {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1C1C1E");
  
  const now = new Date();
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);
  const endOfDay = new Date(); endOfDay.setHours(23,59,59,0);
  const events = await CalendarEvent.between(startOfDay, endOfDay);
  
  // METRICS
  const totalMin = (END_HOUR - START_HOUR) * 60;
  const currentMin = (now.getHours() * 60) + now.getMinutes();
  const startMin = START_HOUR * 60;
  let pctDay = (currentMin - startMin) / totalMin;
  pctDay = Math.max(0, Math.min(1, pctDay));
  
  const totalEvents = events.filter(e => !e.isAllDay).length;
  const remainingEvents = events.filter(e => e.startDate > now && !e.isAllDay).length;
  const doneEvents = totalEvents - remainingEvents;
  const pctTasks = (totalEvents === 0) ? 1 : (doneEvents / totalEvents);
  
  // LAYOUT
  // 1. TOP: Current Time
  const headStack = w.addStack();
  headStack.layoutHorizontally();
  headStack.addSpacer();
  const timeLabel = headStack.addText(now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}));
  timeLabel.font = Font.boldSystemFont(12);
  timeLabel.textColor = Color.gray();
  headStack.addSpacer();
  
  w.addSpacer(10);
  
  // 2. CENTER: Huge "Hours Left" Number
  const timeLeft = Math.max(0, ((1-pctDay) * (END_HOUR-START_HOUR))).toFixed(1);
  const centerStack = w.addStack();
  centerStack.layoutVertically();
  centerStack.centerAlignContent();
  
  const bigNumStack = centerStack.addStack();
  bigNumStack.layoutHorizontally();
  bigNumStack.addSpacer();
  const bigNum = bigNumStack.addText(timeLeft + "h");
  bigNum.font = Font.heavySystemFont(34); // Massive font
  bigNum.textColor = Color.white();
  bigNumStack.addSpacer();
  
  const subLabelStack = centerStack.addStack();
  subLabelStack.layoutHorizontally();
  subLabelStack.addSpacer();
  const subLabel = subLabelStack.addText("REMAINING");
  subLabel.font = Font.systemFont(9);
  subLabel.textColor = Color.gray();
  subLabelStack.addSpacer();
  
  w.addSpacer(14);

  // 3. BOTTOM: Compact Progress Bars
  // Time Bar
  addMicroBar(w, "TIME", pctDay, "#30D158");
  w.addSpacer(6);
  // Task Bar
  addMicroBar(w, "TASKS", pctTasks, "#0A84FF");

  return w;
}

function addMicroBar(w, label, pct, colorHex) {
  const s = w.addStack();
  s.layoutHorizontally();
  s.centerAlignContent();
  
  // Label
  const l = s.addText(label);
  l.font = Font.boldSystemFont(9);
  l.textColor = Color.gray();
  
  s.addSpacer(6);
  
  // Draw Bar
  const ctx = new DrawContext();
  const width = 80; // Fit for small widget
  const height = 6;
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  
  // Bg
  const pathBg = new Path();
  pathBg.addRoundedRect(new Rect(0,0,width,height), 3, 3);
  ctx.addPath(pathBg);
  ctx.setFillColor(new Color("#333333"));
  ctx.fillPath();
  
  // Fill
  if (pct > 0) {
    const fillW = Math.max(6, width * pct);
    const pathFill = new Path();
    pathFill.addRoundedRect(new Rect(0,0,fillW,height), 3, 3);
    ctx.addPath(pathFill);
    ctx.setFillColor(new Color(colorHex));
    ctx.fillPath();
  }
  
  s.addImage(ctx.getImage());
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentSmall();
