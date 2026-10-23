import { Modal, Tooltip } from "antd";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";
import React from "react";
import PlaygroundSettings from "./Settings";

export default function PlaygroundFooter() {
  const [openModal, setOpenModal] = React.useState(false);

  return (
    <>
      <Tooltip title="Playground settings">
        <button
          type="button"
          aria-label="Playground settings"
          onClick={() => setOpenModal(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-fg-subtle shadow-soft transition-all duration-150 hover:text-fg hover:shadow-raised active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </Tooltip>

      <Modal
        zIndex={10000}
        footer={null}
        title="Playground Settings"
        open={openModal}
        onCancel={() => setOpenModal(false)}
      >
        <PlaygroundSettings close={() => setOpenModal(false)} />
      </Modal>
    </>
  );
}
