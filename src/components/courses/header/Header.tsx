import { ReactNode } from "react";

type HeaderSidebar = {
    title: string;
    subTitle: string;
    color?: string;
    icon: ReactNode;
}



export function HeaderSideBar({ title, subTitle, color, icon }: HeaderSidebar) {

    return (

        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subTitle}</p>
                </div>
            </div>
        </div>
    )
}