import React from 'react';
import { RxAvatar } from "react-icons/rx";
import { CiUser } from "react-icons/ci";
import { FaUser } from "react-icons/fa";
import { ImageLoader } from '@/components/ui/helpers/ImageLoader';
import { Button } from '@/components/ui/button/button';


type NavbarProps = {
  userName?: string;
}


export function Navbar({ userName = 'Usuário' }: NavbarProps) {
  return (
    <nav className="h-16 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center bg-gray-50 dark:bg-gray-950 shadow-sm">
      <div className="flex items-center gap-4 ml-auto">
        
        {/*<ImageLoader
          src={src}
          alt="Profile avatar"
          loadingComponent={<ImgSkeleton className="w-10 h-10 rounded-full" />}
          errorComponent={<FaUser strokeWidth={1.25} className="text-blue-gray-500 w-10 h-10" />}
          successComponent={(src) => <RxAvatar
            src={src}
            size="sm"
            variant="circular"
            className="group-hover:p-0.5 transition--base group-hover:border-blue-gray-700 group-active:border-blue-gray-700 group-hover:border"
            loading="lazy"
          />}
        />*/}

        <RxAvatar size={30}/>

        <span className="font-medium text-gray-700 dark:text-gray-200">
          {userName}
        </span>

        <Button
          variant="outline"
          size="sm"
        >
          Sair
        </Button>
      </div>
    </nav>
  );
}
