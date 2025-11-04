import { useEffect } from "react";
import type { UnauthenticatedHomeProps } from "../types/UnauthenticatedHome.type";
import { Target, ChartLine, Sparkles } from "lucide-react";

export default function IsNotAuthenticatedHome({ onSignIn, onSignUp }: UnauthenticatedHomeProps) {

	const scrollToSection = (sectionId: string) => {
		const element = document.getElementById(sectionId);
		element?.scrollIntoView({
			behavior: "smooth",
		});
	};

	useEffect(() => {
		const handleScroll = () => {
			const navbar = document.getElementById("navbar");
			if (window.scrollY > 100) {
				navbar?.classList.add("backdrop-blur-md");
			} else {
				navbar?.classList.remove("backdrop-blur-md");
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	return (
		<div className="bg-gray-900 min-h-screen text-white select-none">
			<nav className="sticky top-0 z-50 backdrop-blur-sm bg-gray-800/95 border-b border-gray-700">
				<div className="mx-5 lg:mx-20 xl:mx-40">
					<div className="flex items-center justify-between min-h-fit">
						<div className="flex items-center">
							<img src="/logo256x256.png" alt="Loozamax Logo" className="h-10 w-10 mr-3" />
							<h1 className="text-2xl font-bold text-white">Loozamax</h1>
						</div>
						<div className="flex flex-col py-2 gap-y-2 md:flex-row md:space-x-4 items-center">
							<button
								onClick={onSignIn}
								className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
								bg-gray-800 text-white border border-gray-700 hover:bg-gray-700 cursor-pointer"
							>
								Connexion
							</button>
							<button
								onClick={onSignUp}
								className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 
								bg-green-600 text-white hover:bg-green-600 cursor-pointer"
							>
								Inscription
							</button>
						</div>
					</div>
				</div>
			</nav>

			<section id="hero" className="h-screen flex items-center justify-center">
				<div className="mx-5 lg:mx-20 xl:mx-40 text-center fade-in">
					<h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 
					bg-clip-text text-transparent">
						Comme le gambling
						<br/>
						mais en mieux
						<br/>
						et gratuit
					</h1>
					<p className="text-gray-400 text-lg lg:text-xl mb-12 max-w-3xl mx-auto">
						Rejoignez la communauté de prédicteurs et testez vos connaissances sur l'actualité, le sport, la
						tech et bien plus encore.
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={onSignUp}
							className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-600 
							hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50 cursor-pointer"
						>
							Commencer gratuitement
						</button>
						<button
							onClick={() => scrollToSection("how-it-works")}
							className="bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg border 
							border-gray-700 hover:bg-gray-700 hover:scale-105 transition-all duration-300 cursor-pointer"
						>
							Découvrir
						</button>
					</div>
				</div>
			</section>

			<section id="how-it-works" className="py-20 pt-36">
				<div className="mx-5 lg:mx-20 xl:mx-40">
					<h2 className="text-3xl font-bold mb-12 text-center">Comment ça marche</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						<div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:shadow-xl hover:scale-105 
						transition-all duration-300">
							<div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
								<Target className="text-white" size={32} />
							</div>
							<h3 className="text-xl font-semibold mb-4">Faites vos prédictions</h3>
							<p className="text-gray-400">
								Choisissez parmi des centaines de prédictions sur l'actualité, le sport, la technologie
								et plus encore.
							</p>
						</div>
						<div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:shadow-xl hover:scale-105 
						transition-all duration-300">
							<div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
								<ChartLine className="text-white" size={32} />
							</div>
							<h3 className="text-xl font-semibold mb-4">Suivez les résultats</h3>
							<p className="text-gray-400">
								Observez l'évolution de vos prédictions en temps réel et comparez-vous aux autres
								utilisateurs.
							</p>
						</div>
						<div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 hover:shadow-xl hover:scale-105 
						transition-all duration-300">
							<div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mb-6">
								<Sparkles className="text-white" size={32} />
							</div>
							<h3 className="text-xl font-semibold mb-4">Distinguez-vous</h3>
							<p className="text-gray-400">
								Accumulez des points et personnalisez votre profil avec des cosmétiques uniques.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section id="cta" className="py-20 bg-gradient-to-r from-green-500/10 to-blue-500/10">
				<div className="mx-5 lg:mx-20 xl:mx-40 text-center">
					<h2 className="text-3xl lg:text-4xl font-bold mb-6">Prêt à tester vos prédictions ?</h2>
					<p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
						Rejoignez des milliers d'utilisateurs qui s'amusent à prédire l'avenir tout en gagnant des
						points.
					</p>
					<button
						onClick={onSignUp}
						className="bg-green-500 text-white px-12 py-4 rounded-xl font-semibold text-xl hover:bg-green-600 
						hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/50 cursor-pointer"
					>
						Rejoindre maintenant
					</button>
				</div>
			</section>

			<footer className="bg-gray-800 border-t border-gray-700 py-8">
				<div className="text-center">
					<p>2025 Loozamax</p>
				</div>
			</footer>
		</div>
	);
}
