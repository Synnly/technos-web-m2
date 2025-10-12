import { Button } from "antd";
import type { UnauthenticatedHomeProps } from "../types/UnauthenticatedHome.type";

export default function IsNotAuthenticatedHome({ onSignIn, onSignUp }: UnauthenticatedHomeProps) {
  return (
    <div className="bg-gray-900 mx-auto px-6 py-8 w-full min-h-screen flex flex-col">
      <h1 className="text-4xl text-white">
        Veuillez vous connecter pour accéder à cette page.
      </h1>
      <Button type="primary" onClick={onSignIn} className="mt-4 w-32">
        Se connecter
      </Button>
      <Button onClick={onSignUp} className="mt-4 w-32">
        S'inscrire
      </Button>
    </div>
  );
}
