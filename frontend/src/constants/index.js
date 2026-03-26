export const APP_NAME = "Shrinath Water Distributors";
export const APP_SHORT = "Shrinath";

export const C = {
  bg:"#F4F6FB", card:"#FFFFFF", border:"#E4E9F2",
  text:"#0F172A", sub:"#475569", mute:"#94A3B8",
  side:"#0C1A35",
  blue:"#2563EB", blueM:"#3B82F6", blueL:"#EFF6FF",
  green:"#059669", greenBg:"#ECFDF5",
  amber:"#D97706", amberBg:"#FFFBEB",
  red:"#DC2626",   redBg:"#FEF2F2",
  violet:"#7C3AED",violetBg:"#F5F3FF",
  teal:"#0891B2",  tealBg:"#ECFEFF",
};

export const TRIP_STATUS_MAP = {
  delivered:{ label:"Delivered",  bg:C.greenBg,  color:C.green,  dot:C.green  },
  "on-way": { label:"On the Way", bg:C.blueL,    color:C.blue,   dot:C.blue   },
  pending:  { label:"Pending",    bg:C.amberBg,  color:C.amber,  dot:C.amber  },
  cancelled:{ label:"Cancelled",  bg:C.redBg,    color:C.red,    dot:C.red    },
};

export const DRIVER_STATUS_MAP = {
  active:   { label:"Available", bg:C.greenBg, color:C.green   },
  "on-trip":{ label:"On Trip",   bg:C.blueL,   color:C.blue    },
  inactive: { label:"Inactive",  bg:"#F1F5F9", color:"#64748B" },
};

export const PAYMENT_MODES = [
  { value:"cash",          label:"Cash"                },
  { value:"upi",           label:"UPI / GPay"          },
  { value:"bank_transfer", label:"NEFT / Bank Transfer" },
];

export const TANK_SIZES = [
  { value:"500 Litre",  label:"500 Litre"  },
  { value:"1000 Litre", label:"1000 Litre" },
  { value:"2000 Litre", label:"2000 Litre" },
];
