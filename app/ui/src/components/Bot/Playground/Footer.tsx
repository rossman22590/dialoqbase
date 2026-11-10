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
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-fg-subtle transition-colors hover:bg-surface-2 hover:text-fg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Cog6ToothIcon className="h-[18px] w-[18px]" />
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
