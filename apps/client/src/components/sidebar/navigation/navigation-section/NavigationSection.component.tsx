import { useAuth } from "../../../../hooks/useAuth";
import NavigationItemComponent from "../navigation-item/NavigationItem.component";
import type { NavigationSectionProps } from "./NavigationSection.interface";

const NavigationSectionComponent: React.FC<NavigationSectionProps> = ({ title, roles, items, collapsed }) => {
  const { isAdmin } = useAuth();

  const shouldRender = roles?.includes("user") || (roles?.includes("admin") && isAdmin);

  if (!shouldRender) return null;

  return (
    <div className="mb-4">
      {!collapsed && (
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavigationItemComponent key={item.id} {...item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
};

export default NavigationSectionComponent;
