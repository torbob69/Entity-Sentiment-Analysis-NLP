import Xlogo from '../assets/Xlogo.png';

export default function Logo({ className = "h-16" }) {
  return (
    <div className="flex items-end">
      <img src={Xlogo} alt="X Logo" className={`${className} w-auto py-1`} />
    </div>
  );
}
