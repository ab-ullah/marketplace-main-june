import { ReactNode } from 'react';

export interface HeaderWithSearchProps {
    title: string;
    onSearch: (value: string) => void;
    leftSideComponents?: ReactNode; 
    searchValue: string;
    isSubtitle?: boolean;
    children?: ReactNode;
}

export interface HeaderProps {
    title: string;
    isSubtitle?: boolean;
    children?: ReactNode;
}

export interface HeaderWithSelectProps {
    title: string;
    isSubtitle?: boolean;
    children?: ReactNode;
    leftSideComponents?: ReactNode;
}
