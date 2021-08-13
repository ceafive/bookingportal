import React from "react";
import Modal from "react-modal";

const customStyles = {
  content: {
    top: "55%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "90%",
    // marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};

// Make sure to bind modal to your appElement (https://reactcommunity.org/react-modal/accessibility/)
Modal.setAppElement("#root");

function App({ modalIsOpen, closeModal, children }) {
  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
      >
        <div className="w-full flex justify-end mb-2">
          <button
            onClick={closeModal}
            className="bg-red-500 px-2 py-1 text-white rounded text-center "
          >
            X
          </button>
        </div>
        {children}
      </Modal>
    </div>
  );
}

export default App;
