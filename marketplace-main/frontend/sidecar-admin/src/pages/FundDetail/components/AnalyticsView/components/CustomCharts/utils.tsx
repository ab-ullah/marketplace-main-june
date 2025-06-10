import { useEffect, useState } from 'react';

export const useWindowWidth = () => {
    const [windowWidth, setWindowWidth] = useState(0);
    const handleResize = () => setWindowWidth(window.innerWidth);
    useEffect(() => {
        setWindowWidth(window.innerWidth)
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return windowWidth;
}

export function getChartCalcs(windowWidth: number) {
    const containerWidth = windowWidth < 566 ? 300 : 435;
    const innerRadius = windowWidth < 566 ? 104 : 174;
    const outerRadius = windowWidth < 566 ? 150 : 218;
    return { containerWidth, innerRadius, outerRadius };

}