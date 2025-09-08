import { ReactNode } from "react";

type HeaderSidebar = {
    title: string;
    subTitle: string;
    color?: string;
    icon: ReactNode;
    onClose?: () => void;
}



export function HeaderSideBar({ title, subTitle, icon, onClose }: HeaderSidebar) {

    return (

        <div className="flex items-center justify-between p-6 border-b rounded-lg border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{subTitle}</p>
                </div>
            </div>
            
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-full hover:bg-white/20 dark:hover:bg-black/20"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    )
}