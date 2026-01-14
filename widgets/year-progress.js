// ==========================================
// YEAR PROGRESS (MACRO TRACKER)
// ==========================================

async function createWidget() {
  const w = new ListWidget();
  w.backgroundColor = new Color("#1C1C1E");
  
  const now = new Date();
  const year = now.getFullYear();
  const start = new Date(year, 0, 1); // Jan 1
  const end = new Date(year + 1, 0, 1); // Jan 1 Next Year
  
  // Math
  const total = end - start;
  const elapsed = now - start;
  let pct = elapsed / total;
  
  // Format
  const pctString = (pct * 100).toFixed(1) + "%";
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  
  // LAYOUT
  w.addSpacer();
  
  // Header
  const head = w.addStack();
  head.layoutHorizontally();
  const hText = head.addText(`${year} PROGRESS`);
  hText.font = Font.boldSystemFont(10);
  hText.textColor = Color.gray();
  head.addSpacer();
  
  w.addSpacer(8);
  
  // Big Percentage
  const body = w.addStack();
  body.layoutHorizontally();
  const big = body.addText(pctString);
  big.font = Font.heavySystemFont(32);
  big.textColor = Color.white();
  body.addSpacer();
  
  w.addSpacer(8);
  
  // Progress Bar
  const ctx = new DrawContext();
  const width = 120;
  const height = 8;
  ctx.size = new Size(width, height);
  ctx.opaque = false;
  
  // Bg
  const pathBg = new Path();
  pathBg.addRoundedRect(new Rect(0,0,width,height), 4, 4);
  ctx.addPath(pathBg);
  ctx.setFillColor(new Color("#333333"));
  ctx.fillPath();
  
  // Fill
  const fillW = width * pct;
  const pathFill = new Path();
  pathFill.addRoundedRect(new Rect(0,0,fillW,height), 4, 4);
  ctx.addPath(pathFill);
  ctx.setFillColor(new Color("#30D158")); // Green matches your other widgets
  ctx.fillPath();
  
  w.addImage(ctx.getImage());
  
  w.addSpacer(10);
  
  // Footer Stats
  const foot = w.addStack();
  foot.layoutHorizontally();
  
  const l1 = foot.addText("REMAINING");
  l1.font = Font.boldSystemFont(9);
  l1.textColor = Color.gray();
  
  foot.addSpacer();
  
  const l2 = foot.addText(`${daysLeft} DAYS`);
  l2.font = Font.boldSystemFont(9);
  l2.textColor = Color.white();
  
  w.addSpacer();

  return w;
}

const widget = await createWidget();
Script.setWidget(widget);
Script.complete();
widget.presentSmall();
