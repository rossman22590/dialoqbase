import { Link } from "react-router-dom";
import { PlusIcon } from "@heroicons/react/24/outline";

export const DashboardNewBtn = () => {
  return (
    <Link to="/new" className="ui-btn-primary">
      <PlusIcon aria-hidden="true" />
      Create new bot
    </Link>
  );
};
