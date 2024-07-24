/* eslint-disable react/prop-types */
// import React from "react";
import { FaXTwitter } from "react-icons/fa6";
import { FaTelegramPlane } from "react-icons/fa";

const Footer = () => {
  const FooterLinkBtn = ({ linkIcon, Link }) => {
    return <a href={Link} target="_blank" className="bg-black p-1 rounded-md h-fit" rel="noreferrer">{linkIcon}</a>;
  };

  const year = new Date().getFullYear();
  const iconSize = 36;
  return (
    <footer className="flex flex-col justify-center items-center pt-[60px] pb-[100px]">
      <section className="flex justify-center space-x-6 items-center">
        <FooterLinkBtn linkIcon={<FaTelegramPlane size={iconSize-4} />} Link="#"  />
        <FooterLinkBtn linkIcon={<FaXTwitter size={iconSize} />} Link="#" />
      </section>
      <h5 className="text-[16px] mt-[30px] font-[400]">COPYRIGHT © {year} HOME Staking</h5>
    </footer>
  );
};

export default Footer;
