import { Card } from "@/components/ui/card";

type Props = {
  className?: string;
  children: React.ReactNode;
};

const BlankCard = ({ children, className = "" }: Props) => {
  return (
    <Card className={`p-0 relative shadow-2xl ${className}`}>
      {children}
    </Card>
  );
};

export default BlankCard;
