import Logo from "../components/logo";
import backend_url from "../../constants"
export default function Login() {
const redirect_login = () =>{
    window.location.href = `${backend_url}/login`
}

  return (
    <div className="flex justify-center items-center">
      <div className="bg-red-5 w-3xl h-screen flex flex-col p-md items-center justify-center">
            <div className="flex flex-col items-center justify-center w-full">
                <Logo></Logo>
                <p className="font-sans text-xl text-white mb-4 mt-12">Sentiment analysis tool for X</p>
                <p className="text-white/40 text-center w-[70%] mb-8 text-xs">Login with your own X account to access our tool by clicking the button below, and we will direct you to X authorization page.</p>
                <button onClick={redirect_login} className="bg-sky-600 text-white py-2 px-4 rounded-full font-semibold">Login with X</button>
            </div>
      </div>
    </div>
  );
}
