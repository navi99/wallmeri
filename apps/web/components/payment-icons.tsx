import Image from "next/image";

const paymentBrands = [
  { src: "/payments/google-pay.png", alt: "Google Pay" },
  { src: "/payments/phonepe.png", alt: "PhonePe" },
  { src: "/payments/paytm.png", alt: "Paytm" },
  { src: "/payments/mastercard.png", alt: "Mastercard" },
  { src: "/payments/visa.png", alt: "Visa" },
  { src: "/payments/rupay.png", alt: "RuPay" },
];

export function PaymentIcons() {
  return (
    <>
      {paymentBrands.map((brand) => (
        <Image
          key={brand.src}
          src={brand.src}
          alt={brand.alt}
          width={40}
          height={40}
          className="h-8 w-8 shrink-0 object-contain"
        />
      ))}
    </>
  );
}
