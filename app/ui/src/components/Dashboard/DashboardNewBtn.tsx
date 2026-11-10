import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

export const DashboardNewBtn = () => {
  return (
    <Link to="/new" className="ui-btn-primary h-10 px-4">
      <PlusIcon aria-hidden="true" />
      New bot
    </Link>
  );
};
