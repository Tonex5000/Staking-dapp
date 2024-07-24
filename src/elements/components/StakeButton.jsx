/* eslint-disable react/prop-types */

const StakeButton = ({ buttonText, paddingBottom, type, disabled, onClick }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-[#77787D] w-full py-2 rounded-[20px] my-[24px] uppercase text-white text-[20px] font-[400] tracking-[0.5714px] leading-[35px] mb-${paddingBottom}`}
  >
    {buttonText}
  </button>
);

export default StakeButton;
