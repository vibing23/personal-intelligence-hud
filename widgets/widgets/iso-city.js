// ==========================================
// ISOMETRIC CITY CALENDAR
// A 3D Visualization of your daily density
// ==========================================

// CONFIGURATION
const START_HOUR = 8;  // 8 AM
const HOURS_TO_SHOW = 10; // Show next 10 hours
const BAR_WIDTH = 26; 
const MAX_HEIGHT = 60; // Height of a "Busy" block

// THEME COLORS (SimCity Vibe)
const C_BG = new Color("#141414");
const C_GROUND = new Color("#222222");
const C_TOP_FREE = new Color("#30D158"); // Green top for free time
const C_TOP_BUSY = new Color("#FF453A"); // Red top for busy
const C_SIDE_L = new Color("#ffffff", 0.15); // Left face shading
const C_SIDE_R = new Color("#000000", 0.3);  // Right face shading

async function createWidget() {
  const w = new ListWidget();
  w.backgroundColor = C_BG;
  
  // 1. Fetch Calendar Data
  const now = new Date();
  const events = await getEvents(now);
  const densityMap = getDensityMap(events, now);

  // 2. Setup Drawing Context (High Res)
  const wSize = 600; 
  const hSize = 350;
  const ctx = new DrawContext();
  ctx.size = new Size(wSize, hSize);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  // 3. Draw The "Ground" Grid (Decoration)
  drawGround(ctx, wSize, hSize);

  // 4. Draw The Skyline (The Bars)
  // We draw from back to front (though here it's a straight line, so order is easy)
  const startX = 60;
  const startY = 200;
  
  for (let i = 0; i < HOURS_TO_SHOW; i++) {
    const hourOffset = i;
    const hourData = densityMap[i];
    
    // Calculate 3D Position
    // Isometric step: Move right AND down slightly for diagonal effect
    // Or just straight line for "Cabinet" projection. 
    // Let's do a true staggered isometric line.
    const isoX = startX + (i * 45); 
    const isoY = startY + (i * 10); // Slight slope down
    
    // Determine Height based on events
    // 0 events = Low slab. 1+ = Tall block.
    let intensity = hourData.count; 
    let isCurrentHour = (i === 0);
    
    // Color Logic
    let baseColor = (intensity === 0) ? C_TOP_FREE : C_TOP_BUSY;
    if (isCurrentHour) baseColor = new Color("#0A84FF"); // Blue for NOW
    
    // Height Logic (Free = 10px slab, Busy = scales up)
    let blockH = (intensity === 0) ? 12 : 30 + (intensity * 15);
    if (blockH > MAX_HEIGHT) blockH = MAX_HEIGHT;

    drawIsoBlock(ctx, isoX, isoY, BAR_WIDTH, blockH, baseColor);
    
    // Draw Time Label under the block
    drawText(ctx, formatHour(hourData.hour), isoX - 10, isoY + 20, 14, Color.gray());
  }

  // 5. Add Image to Widget
  w.addImage(ctx.getImage());
  
  // 6. Header Text
  w.addSpacer(-300); // Pull text to top
  const head = w.addStack();
  head.layoutVertically();
  
  const t1 = head.addText("PRODUCTIVITY_SKYLINE");
  t1.font = new Font("Menlo-Bold", 10);
  t1.textColor = Color.gray();
  
  const t2 = head.addText(events.length + " BLOCKS SCHEDULED");
  t2.font = new Font("Menlo-Bold", 16);
  t2.textColor = Color.white();

  return w;
}

// ==========================================
// 3D DRAWING ENGINE
// ==========================================

function drawIsoBlock(ctx, x, y, width, height, color) {
  // Isometric Cube Mathematics
  // We draw 3 faces: Top, Left, Right
  
  const skew = width * 0.5; // How much the top tilts
  
  // 1. LEFT FACE (Rectangle skewed)
  // Simply: x,y is bottom center corner
  // Let's define the 3 visible vertices of the "Y" shape
  const centerBottom = new Point(x, y);
  const centerTop = new Point(x, y - height);
  const leftBottom = new Point(x - width, y - skew);
  const leftTop = new Point(x - width, y - height - skew);
  const rightBottom = new Point(x + width, y - skew);
  const rightTop = new Point(x + width, y - height - skew);
  
  // Draw Left Face
  const pathL = new Path();
  pathL.move(centerBottom);
  pathL.addLine(centerTop);
  pathL.addLine(leftTop);
  pathL.addLine(leftBottom);
  pathL.closeSubpath();
  ctx.addPath(pathL);
  ctx.setFillColor(color); 
  ctx.fillPath();
  // Add Shadow overlay
  ctx.addPath(pathL);
  ctx.setFillColor(C_SIDE_L);
  ctx.fillPath();

  // Draw Right Face
  const pathR = new Path();
  pathR.move(centerBottom);
  pathR.addLine(centerTop);
  pathR.addLine(rightTop);
  pathR.addLine(rightBottom);
  pathR.closeSubpath();
  ctx.addPath(pathR);
  ctx.setFillColor(color);
  ctx.fillPath();
  // Add Darker Shadow
  ctx.addPath(pathR);
  ctx.setFillColor(C_SIDE_R);
  ctx.fillPath();

  // Draw Top Face (The Rhombus)
  const pathT = new Path();
  pathT.move(centerTop);
  pathT.addLine(leftTop);
  // We need a back corner for the top
  const backTop = new Point(x, y - height - (skew * 2));
  pathT.addLine(backTop);
  pathT.addLine(rightTop);
  pathT.closeSubpath();
  ctx.addPath(pathT);
  ctx.setFillColor(color); // Pure color on top
  ctx.fillPath();
  
  // Highlight edge
  ctx.addPath(pathT);
  ctx.setStrokeColor(new Color("#ffffff", 0.4));
  ctx.setLineWidth(1);
  ctx.strokePath();
}

function drawGround(ctx, w, h) {
  // Draw a cool wireframe grid on the floor
  ctx.setStrokeColor(new Color("#333333"));
  ctx.setLineWidth(1);
  
  const p = new Path();
  // Horizontal-ish lines
  for(let i=100; i<h; i+=40) {
    p.move(new Point(0, i));
    p.addLine(new Point(w, i + 100));
  }
  ctx.addPath(p);
  ctx.strokePath();
}

function drawText(ctx, text, x, y, size, color) {
  ctx.setFont(new Font("Menlo", size));
  ctx.setTextColor(color);
  ctx.drawText(text, new Point(x, y));
}

// ==========================================
// DATA LOGIC
// ==========================================

async function getEvents(date) {
  const start = new Date(date.getTime());
  start.setHours(0,0,0,0);
  const end = new Date(date.getTime());
  end.setHours(23,59,59,0);
  return await CalendarEvent.between(start, end);
}

function getDensityMap(events, now) {
  // Create array of next 10 hours
  let map = [];
  let currentH = now.getHours();
  
  for(let i=0; i<HOURS_TO_SHOW; i++) {
    let checkH = currentH + i;
    // Simple logic: how many events intersect this hour?
    let count = 0;
    
    // Check overlap
    events.forEach(e => {
      let sH = e.startDate.getHours();
      let eH = e.endDate.getHours();
      if (checkH >= sH && checkH < eH) count++;
      // Handle <1 hour meetings
      if (sH === checkH && eH === checkH) count++;
    });
    
    map.push({ hour: checkH, count: count });
  }
  return map;
}

function formatHour(h) {
  if (h > 23) h = h - 24;
  let ampm = h >= 12 ? "PM" : "AM";
  let show = h % 12;
  if (show === 0) show = 12;
  return `${show}`;
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentMedium();
