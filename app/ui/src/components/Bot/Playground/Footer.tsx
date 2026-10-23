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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-gray-100"
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
