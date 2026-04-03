import { ArrowUp, ArrowDown, Users, ShoppingCart, DollarSign, TrendingUp, TrendingDown, FileText, Target, Building, MessageCircle, Utensils, Calendar, Star, Briefcase, Car, Book, Heart } from "lucide-react";
import { useAnimatedCounter } from "@Tenant/hooks/useAnimatedCounter";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  positive: boolean;
  icon: string;
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-6 w-6" />,
  "shopping-cart": <ShoppingCart className="h-6 w-6" />,
  "dollar-sign": <DollarSign className="h-6 w-6" />,
  "trending-up": <TrendingUp className="h-6 w-6" />,
  "trending-down": <TrendingDown className="h-6 w-6" />,
  "file-text": <FileText className="h-6 w-6" />,
  target: <Target className="h-6 w-6" />,
  building: <Building className="h-6 w-6" />,
  "message-circle": <MessageCircle className="h-6 w-6" />,
  utensils: <Utensils className="h-6 w-6" />,
  calendar: <Calendar className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
  briefcase: <Briefcase className="h-6 w-6" />,
  car: <Car className="h-6 w-6" />,
  book: <Book className="h-6 w-6" />,
  heart: <Heart className="h-6 w-6" />,
};

const gradientMap: Record<string, string> = {
  users: "from-primary/15 to-primary/5",
  "shopping-cart": "from-[hsl(160,84%,39%)]/15 to-[hsl(160,84%,39%)]/5",
  "dollar-sign": "from-[hsl(38,92%,50%)]/15 to-[hsl(38,92%,50%)]/5",
  "trending-up": "from-[hsl(280,68%,60%)]/15 to-[hsl(280,68%,60%)]/5",
  "trending-down": "from-[hsl(0,72%,51%)]/15 to-[hsl(0,72%,51%)]/5",
  "file-text": "from-[hsl(210,70%,50%)]/15 to-[hsl(210,70%,50%)]/5",
  target: "from-[hsl(340,75%,55%)]/15 to-[hsl(340,75%,55%)]/5",
  building: "from-[hsl(220,60%,50%)]/15 to-[hsl(220,60%,50%)]/5",
  "message-circle": "from-[hsl(200,70%,50%)]/15 to-[hsl(200,70%,50%)]/5",
  utensils: "from-[hsl(25,90%,50%)]/15 to-[hsl(25,90%,50%)]/5",
  calendar: "from-[hsl(250,60%,55%)]/15 to-[hsl(250,60%,55%)]/5",
  star: "from-[hsl(45,93%,47%)]/15 to-[hsl(45,93%,47%)]/5",
  briefcase: "from-[hsl(190,70%,42%)]/15 to-[hsl(190,70%,42%)]/5",
  car: "from-[hsl(170,65%,40%)]/15 to-[hsl(170,65%,40%)]/5",
  book: "from-[hsl(260,55%,55%)]/15 to-[hsl(260,55%,55%)]/5",
  heart: "from-[hsl(350,80%,55%)]/15 to-[hsl(350,80%,55%)]/5",
};

const iconColorMap: Record<string, string> = {
  users: "text-primary",
  "shopping-cart": "text-[hsl(160,84%,39%)]",
  "dollar-sign": "text-[hsl(38,92%,50%)]",
  "trending-up": "text-[hsl(280,68%,60%)]",
  "trending-down": "text-[hsl(0,72%,51%)]",
  "file-text": "text-[hsl(210,70%,50%)]",
  target: "text-[hsl(340,75%,55%)]",
  building: "text-[hsl(220,60%,50%)]",
  "message-circle": "text-[hsl(200,70%,50%)]",
  utensils: "text-[hsl(25,90%,50%)]",
  calendar: "text-[hsl(250,60%,55%)]",
  star: "text-[hsl(45,93%,47%)]",
  briefcase: "text-[hsl(190,70%,42%)]",
  car: "text-[hsl(170,65%,40%)]",
  book: "text-[hsl(260,55%,55%)]",
  heart: "text-[hsl(350,80%,55%)]",
};

const parseNumericValue = (value: string): { number: number; prefix: string; suffix: string } => {
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[^0-9,.]*$/)?.[0] || "";
  const numStr = value.replace(/[^0-9.]/g, "");
  return { number: parseFloat(numStr) || 0, prefix, suffix };
};

const formatNumber = (num: number, original: string): string => {
  const { prefix, suffix } = parseNumericValue(original);
  if (original.includes(",")) {
    return prefix + num.toLocaleString("en-US") + suffix;
  }
  if (original.includes(".") && !original.includes(",")) {
    const decimalPlaces = original.split(".")[1]?.replace(/[^0-9]/g, "").length || 0;
    return prefix + num.toFixed(decimalPlaces) + suffix;
  }
  return prefix + num.toLocaleString("en-US") + suffix;
};

const MetricCard = ({ title, value, change, positive, icon }: MetricCardProps) => {
  const { number: targetNum } = parseNumericValue(value);
  const animatedNum = useAnimatedCounter(targetNum);
  const displayValue = formatNumber(animatedNum, value);

  return (
    <div className="group rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-card-foreground tabular-nums tracking-tight">
            {displayValue}
          </h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientMap[icon] || "from-primary/15 to-primary/5"} ${iconColorMap[icon] || "text-primary"} transition-transform duration-300 group-hover:scale-110`}>
          {iconMap[icon] || <TrendingUp className="h-6 w-6" />}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-semibold ${
            positive
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {change}%
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
};

export default MetricCard;
