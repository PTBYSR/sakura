
import React from 'react';
import DashboardCard from '@/app/(DashboardLayout)//components/shared/DashboardCard';

const products = [
    {
        id: "1",
        name: "Sunil Joshi",
        post: "Web Designer",
        pname: "Elite Admin",
        priority: "Low",
        pbg: "#FDA4B8",
        budget: "3.9",
    },
    {
        id: "2",
        name: "Andrew McDownland",
        post: "Project Manager",
        pname: "Real Homes WP Theme",
        priority: "Medium",
        pbg: "#EE66AA",
        budget: "24.5",
    },
    {
        id: "3",
        name: "Christopher Jamil",
        post: "Project Manager",
        pname: "MedicalPro WP Theme",
        priority: "High",
        pbg: "#FA896B",
        budget: "12.8",
    },
    {
        id: "4",
        name: "Nirav Joshi",
        post: "Frontend Engineer",
        pname: "Hosting Press HTML",
        priority: "Critical",
        pbg: "#13DEB9",
        budget: "2.4",
    },
];


const ProductPerformance = () => {
    return (

        <DashboardCard title="Product Performance">
            <div className="overflow-auto w-full mt-2">
                <table className="min-w-[600px] w-full text-left">
                    <thead>
                        <tr className="text-gray-300 text-sm">
                            <th className="py-2 px-3">Id</th>
                            <th className="py-2 px-3">Assigned</th>
                            <th className="py-2 px-3">Name</th>
                            <th className="py-2 px-3">Priority</th>
                            <th className="py-2 px-3 text-right">Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id} className="border-t border-[#333]">
                                <td className="py-3 px-3 text-white font-medium text-[15px]">{product.id}</td>
                                <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                        <div>
                                            <div className="text-white font-semibold text-sm">{product.name}</div>
                                            <div className="text-gray-400 text-xs">{product.post}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 px-3 text-gray-300 text-sm">{product.pname}</td>
                                <td className="py-3 px-3">
                                    <span className="inline-flex items-center text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: product.pbg }}>
                                        {product.priority}
                                    </span>
                                </td>
                                <td className="py-3 px-3 text-right text-white font-semibold">${product.budget}k</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardCard>
    );
};

export default ProductPerformance;
