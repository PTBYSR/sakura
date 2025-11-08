import React from "react";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode | any;
  footer?: React.ReactNode;
  cardheading?: string | React.ReactNode;
  headtitle?: string | React.ReactNode;
  headsubtitle?: string | React.ReactNode;
  children?: React.ReactNode;
  middlecontent?: string | React.ReactNode;
};

const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  footer,
  cardheading,
  headtitle,
  headsubtitle,
  middlecontent,
}: Props) => {
  return (
    <Card className="p-0 shadow-2xl">
      {cardheading ? (
        <CardContent>
          <h5 className="text-xl font-semibold text-white">{headtitle}</h5>
          <p className="text-sm text-gray-400 mt-1">{headsubtitle}</p>
        </CardContent>
      ) : (
        <CardContent className="p-8">
          {title && (
            <div className="flex flex-row gap-4 justify-between items-center mb-6">
              <div>
                {title && <h5 className="text-xl font-semibold text-white">{title}</h5>}
                {subtitle && (
                  <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
                )}
              </div>
              {action}
            </div>
          )}

          {children}
        </CardContent>
      )}

      {middlecontent}
      {footer}
    </Card>
  );
};

export default DashboardCard;
