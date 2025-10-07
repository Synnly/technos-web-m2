export interface NavigationItemProps {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    colorScheme: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange' | 'pink';
    path: string;
}