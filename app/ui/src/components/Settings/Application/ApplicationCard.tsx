import { Card, CardHeader } from "../../ui";

export const ApplicationCard = ({
  children,
  description,
  title,
  icon,
  className,
  style,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <Card className={className} style={style}>
      <CardHeader icon={icon} title={title} description={description} />
      {children}
    </Card>
  );
};
