/* eslint-disable react/prop-types */

import loading from "../../assets/91.svg";
import Loader from "../circle-loader/Loader";

const StakeButton = ({
  buttonText,
  paddingBottom,
  type,
  disabled,
  onClick,
  Loading
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-[#77787D] w-full py-2 rounded-[20px] my-[24px] uppercase text-white text-[20px] font-[400] tracking-[0.5714px] leading-[35px] flex justify-center items-center  mb-${paddingBottom} h-[4rem] ${loading === true && "opacity-50"}`}
  >
    {Loading ? <Loader /> : buttonText}
  </button>
);

export default StakeButton;
