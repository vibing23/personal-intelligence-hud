// ==========================================
// EXECUTIVE AGENDA (TRAFFIC LIGHT EDITION)
// ==========================================

const BG_COLOR = new Color("#1C1C1E");
const BUSY_COLOR = new Color("#FF453A"); // Red (Stop/Busy)
const FREE_COLOR = new Color("#30D158"); // Green (Go/Free)
const TEXT_WHITE = Color.white();
const TEXT_DIM = new Color("#8E8E93");

async function createWidget() {
  const w = new ListWidget();
  w.backgroundColor = BG_COLOR;
  
  // 1. DATA
  const now = new Date();
  const start = new Date();
  const end = new Date(now.getTime() + 24*60*60*1000);
  const events = await CalendarEvent.between(start, end);
  
  // Filter active/upcoming
  const upcoming = events
    .filter(e => !e.isAllDay && e.endDate > now)
    .slice(0, 3);
    
  // Check if we are currently in a meeting
  const currentEvent = upcoming.find(e => e.startDate <= now && e.endDate > now);
  const isBusyNow = (currentEvent !== undefined);
  
  // 2. LAYOUT
  const main = w.addStack();
  main.layoutHorizontally();
  
  // --- LEFT COL: STATUS ---
  const leftCol = main.addStack();
  leftCol.layoutVertically();
  leftCol.centerAlignContent();
  
  // Big Hour
  const timeStr = now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false});
  const tClock = leftCol.addText(timeStr);
  tClock.font = new Font("Menlo-Bold", 26);
  tClock.textColor = TEXT_WHITE;
  
  leftCol.addSpacer(4);
  
  // Status Indicator
  if (isBusyNow) {
    // BUSY STATE
    const tStatus = leftCol.addText("🔴 BUSY");
    tStatus.font = new Font("Menlo-Bold", 12);
    tStatus.textColor = BUSY_COLOR;
    
    // Show when it ends
    const minLeft = Math.ceil((currentEvent.endDate - now) / 60000);
    const tUntil = leftCol.addText(`Free in ${minLeft}m`);
    tUntil.font = new Font("Menlo", 10);
    tUntil.textColor = TEXT_DIM;
    
  } else {
    // FREE STATE
    const tStatus = leftCol.addText("🟢 AVAILABLE");
    tStatus.font = new Font("Menlo-Bold", 12);
    tStatus.textColor = FREE_COLOR;
    
    // Calculate Next Gap
    let gapMsg = "";
    if (upcoming.length > 0) {
      const nextStart = upcoming[0].startDate;
      const mins = Math.floor((nextStart - now) / 60000);
      if (mins < 60) gapMsg = `${mins}m gap`;
      else gapMsg = `${Math.floor(mins/60)}h ${mins%60}m gap`;
    } else {
      gapMsg = "Clear";
    }
    
    const tUntil = leftCol.addText(gapMsg);
    tUntil.font = new Font("Menlo", 10);
    tUntil.textColor = TEXT_DIM;
  }
  
  // Divider
  main.addSpacer(15);
  const div = main.addStack();
  div.size = new Size(1, 100);
  div.backgroundColor = new Color("#333333");
  main.addSpacer(15);
  
  // --- RIGHT COL: AGENDA ---
  const rightCol = main.addStack();
  rightCol.layoutVertically();
  
  if (upcoming.length === 0) {
    const tEmpty = rightCol.addText("NO PENDING OPS");
    tEmpty.font = new Font("Menlo", 12);
    tEmpty.textColor = TEXT_DIM;
  } else {
    upcoming.forEach(e => {
      drawEventRow(rightCol, e, now);
      rightCol.addSpacer(6);
    });
  }

  return w;
}

function drawEventRow(stack, event, now) {
  const row = stack.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();
  
  const isNow = (event.startDate <= now && event.endDate > now);
  
  // 1. Vertical Color Bar
  const bar = row.addStack();
  bar.size = new Size(3, 24);
  // Red if busy now, otherwise Calendar Color
  bar.backgroundColor = isNow ? BUSY_COLOR : new Color(event.calendar.color.hex);
  bar.cornerRadius = 1;
  
  row.addSpacer(8);
  
  // 2. Text Stack
  const txtStack = row.addStack();
  txtStack.layoutVertically();
  
  const title = txtStack.addText(event.title);
  // Bold if active
  title.font = isNow ? new Font("Menlo-Bold", 11) : new Font("Menlo", 11);
  title.textColor = isNow ? TEXT_WHITE : new Color("#CCCCCC");
  title.lineLimit = 1;
  
  // Time formatting
  const sTime = event.startDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false});
  // If active, show "Ends at X", else show "Start - End"
  const subText = isNow 
    ? `ENDS ${event.endDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false})}` 
    : `${sTime}`;
    
  const sub = txtStack.addText(subText);
  sub.font = new Font("Menlo", 9);
  sub.textColor = isNow ? BUSY_COLOR : TEXT_DIM;
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
