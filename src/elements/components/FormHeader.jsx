/* eslint-disable react/prop-types */

const FormHeader = ({ leading, value }) => (
  <div>
    <section className="flex justify-between items-end mt-[24px]">
      <h3 className="text-[18px] font-[400]">{leading}</h3>
      <h3 className="text-[24px] font-[500]">{value}</h3>
    </section>
    <hr />
  </div>
);

export default FormHeader;
