import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import Link from 'next/link';

const RecentTransactions = () => {
  const transactions = [
    { time: "09:30 am", content: "Payment received from John Doe of $385.90", color: "primary" },
    { time: "10:00 am", content: "New sale recorded", link: "#ML-3467", color: "secondary" },
    { time: "12:00 am", content: "Payment was made of $64.95 to Michael", color: "success" },
    { time: "09:30 am", content: "New sale recorded", link: "#ML-3467", color: "warning" },
    { time: "09:30 am", content: "New arrival recorded", color: "error" },
    { time: "12:00 am", content: "Payment Received", color: "success" },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "border-[#EE66AA]";
      case "secondary":
        return "border-gray-500";
      case "success":
        return "border-green-500";
      case "warning":
        return "border-yellow-500";
      case "error":
        return "border-red-500";
      default:
        return "border-gray-500";
    }
  };

  return (
    <DashboardCard title="Recent Transactions">
      <div className="relative">
        <div className="space-y-0">
          {transactions.map((transaction, index) => (
            <div key={index} className="flex items-start gap-4 pb-6 last:pb-0 relative">
              {/* Time */}
              <div className="flex-[0.5] text-sm text-gray-400 pt-1">
                {transaction.time}
              </div>
              
              {/* Timeline separator */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 ${getColorClasses(transaction.color)} bg-[#1e1e1e] flex items-center justify-center flex-shrink-0`} />
                {index < transactions.length - 1 && (
                  <div className="w-px h-full bg-gray-700 mt-2 min-h-[24px]" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 pt-1">
                {transaction.link ? (
                  <div className="text-sm text-gray-200">
                    <span className="font-semibold">{transaction.content}</span>{' '}
                    <Link href="/" className="text-[#EE66AA] hover:underline">
                      {transaction.link}
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-gray-200">{transaction.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
};

export default RecentTransactions;
