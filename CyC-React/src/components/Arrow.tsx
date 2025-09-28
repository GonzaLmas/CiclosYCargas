type Direction = "up" | "right" | "down" | "upRight" | "downRight";

const arrowRotations: Record<Direction, string> = {
  up: "-135deg",
  right: "-45deg",
  down: "45deg",
  upRight: "-90deg",
  downRight: "0deg",
};

const arrowColors: Record<Direction, string> = {
  up: "bg-green-500",
  right: "bg-blue-500",
  down: "bg-red-500",
  upRight: "bg-yellow-500",
  downRight: "bg-orange-500",
};

interface ArrowProps {
  direction?: Direction;
}

export default function Arrow({ direction = "up" }: ArrowProps) {
  const rotation = arrowRotations[direction];
  const colorClass = arrowColors[direction];

  return (
    <div
      className={`w-4 h-4 ${colorClass} rounded-sm flex items-center justify-center`}
    >
      <div
        className="w-2 h-2 border-white border-r-2 border-b-2"
        style={{ transform: `rotate(${rotation})` }}
      />
    </div>
  );
}
