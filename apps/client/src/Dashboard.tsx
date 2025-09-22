import axios from "axios";
import { useForm } from "react-hook-form";
import { useAuth } from "./hooks/useAuth";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import PasswordWithConfirmationInput from "./PasswordWithConfirmationInput";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

interface TokenJwtPayload extends JwtPayload {
  username: string;
}

type FormData = {
  username: string;
  password: string;
};

/**
 * Composant Dashboard pour la gestion du profil utilisateur.
 *
 * Ce composant permet à l'utilisateur authentifié de :
 * - Consulter et modifier son nom d'utilisateur et son mot de passe.
 * - Supprimer son compte avec confirmation.
 *
 * Fonctionnalités :
 * - Récupère le nom d'utilisateur depuis le token JWT stocké dans le localStorage.
 * - Gère la soumission du formulaire pour mettre à jour les informations via l'API.
 * - Rafraîchit le token d'authentification après une mise à jour réussie.
 * - Propose un bouton pour supprimer le compte utilisateur, avec une confirmation.
 * - Gère les tokens invalides ou expirés en déconnectant l'utilisateur.
 *
 * @component
 * @returns {JSX.Element} L'interface du dashboard.
 */
function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // récupération du username depuis le token et vérification de sa validité
  const token = localStorage.getItem("token");
  let username = "";
  if (token) {
    try {
      username = jwtDecode<TokenJwtPayload>(token).username;
    } catch (err) {
      console.error("Token invalide :", err);
      logout();
    }
  }

  const { register, handleSubmit, watch } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const updatedUser = {
      username: data.username,
      motDePasse: data.password,
    };

    // update de l'utilisateur
    axios.put(`${API_URL}/user/${username}`, updatedUser).then(() => {
      // reconnexion pour rafraîchir le token
      axios
        .post(`${API_URL}/user/login`, {
          username: data.username,
          password: data.password,
        })
        .then((response) => {
          localStorage.setItem("token", response.data.token.token);
          window.location.reload();
        });
    });
  };

  const confirmAccountDeletionHandler = () => {
    if (!token) return;

    let decodedToken: TokenJwtPayload;
    try {
      decodedToken = jwtDecode<TokenJwtPayload>(token);
    } catch (err) {
      console.error("Token invalide :", err);
      logout();
      return;
    }

    if (
      confirm(
        "Êtes vous sur de vouloir supprimer votre compte ? Cette action est irréversible !"
      )
    ) {
      axios.delete(`${API_URL}/user/${decodedToken.username}`).then(() => {
        logout();
        navigate("/signup", { replace: true });
      });
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <form className="App" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          {...register("username", {
            required: "Champ requis",
            minLength: {
              value: 3,
              message:
                "Le nom d'utilisateur doit contenir au moins 3 caractères",
            },
          })}
          placeholder="Nom d'utilisateur"
          defaultValue={username}
        />

        <PasswordWithConfirmationInput register={register} watch={watch} />

        <input type="submit" style={{ backgroundColor: "#a1eafb" }} />
      </form>

      <button onClick={confirmAccountDeletionHandler}>
        Supprimer le compte
      </button>
    </div>
  );
}

export default Dashboard;


// import React, { useState } from 'react';
// import { 
//   Eye, Users, Trophy, Flame, Plus, CheckSquare, CircleCheck, 
//   Edit, Reply, Heart, ShoppingBag, Palette, Star, Sparkles, 
//   Gift, Coins, LogOut, TrendingUp, MessageCircle, Menu, X
// } from 'lucide-react';

// const Dashboard = () => {
//   const [activeSection, setActiveSection] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const handleSectionClick = (sectionId : any) => {
//     setActiveSection(sectionId);
//     console.log(`Clicked section: ${sectionId}`);
//     // Close sidebar on mobile after clicking
//     setSidebarOpen(false);
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   return (
//     <div className="bg-gray-900 text-white min-h-screen">
//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700 z-50">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
//           <div className="flex items-center space-x-2 sm:space-x-3">
//             {/* Mobile menu button */}
//             <button
//               onClick={toggleSidebar}
//               className="lg:hidden p-1 rounded-lg hover:bg-gray-700 transition-colors"
//             >
//               {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
//             </button>
            
//             <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
//               <div className="w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full animate-pulse"></div>
//             </div>
//             <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
//               FutureCast
//             </h1>
//           </div>
          
//           <div className="flex items-center space-x-2 sm:space-x-4">
//             <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-700 rounded-full px-2 sm:px-4 py-1 sm:py-2">
//               <Coins className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
//               <span className="text-xs sm:text-sm font-medium">2,450</span>
//             </div>
//             <img 
//               src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" 
//               alt="Profile" 
//               className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-600"
//             />
//           </div>
//         </div>
//       </header>

//       {/* Mobile overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar Navigation */}
//       <aside className={`
//         fixed left-0 top-20 h-full w-72 bg-gray-800 border-r border-gray-700 overflow-y-auto z-40 transform transition-transform duration-300 ease-in-out
//         ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
//         lg:translate-x-0
//       `}>
//         <div className="p-4 sm:p-6">
//           <nav className="space-y-2">
//             {/* Prediction Actions */}
//             <div className="mb-6">
//               <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                 Predictions
//               </h3>
              
//               <button
//                 onClick={() => handleSectionClick('create-prediction')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
//                   <Plus className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Create Prediction</span>
//                   <p className="text-xs text-gray-400 truncate">Start a new forecast</p>
//                 </div>
//               </button>

//               <button
//                 onClick={() => handleSectionClick('vote-prediction')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
//                   <CheckSquare className="text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Vote on Predictions</span>
//                   <p className="text-xs text-gray-400 truncate">Cast your vote</p>
//                 </div>
//               </button>

//               <button
//                 onClick={() => handleSectionClick('confirm-result')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
//                   <CircleCheck className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Confirm Results</span>
//                   <p className="text-xs text-gray-400 truncate">Verify outcomes</p>
//                 </div>
//               </button>
//             </div>

//             {/* Community Actions */}
//             <div className="mb-6">
//               <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                 Community
//               </h3>
              
//               <button
//                 onClick={() => handleSectionClick('create-post')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
//                   <Edit className="text-indigo-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Create Post</span>
//                   <p className="text-xs text-gray-400 truncate">Share your thoughts</p>
//                 </div>
//               </button>

//               <button
//                 onClick={() => handleSectionClick('reply-post')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
//                   <Reply className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Reply to Posts</span>
//                   <p className="text-xs text-gray-400 truncate">Join discussions</p>
//                 </div>
//               </button>

//               <button
//                 onClick={() => handleSectionClick('like-post')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
//                   <Heart className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Like Posts</span>
//                   <p className="text-xs text-gray-400 truncate">Show appreciation</p>
//                 </div>
//               </button>
//             </div>

//             {/* Profile Actions */}
//             <div className="mb-6">
//               <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
//                 Profile
//               </h3>
              
//               <button
//                 onClick={() => handleSectionClick('buy-cosmetic')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-500/20 rounded-lg flex items-center justify-center group-hover:bg-pink-500/30 transition-colors">
//                   <ShoppingBag className="text-pink-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Buy Cosmetics</span>
//                   <p className="text-xs text-gray-400 truncate">Customize your look</p>
//                 </div>
//               </button>

//               <button
//                 onClick={() => handleSectionClick('change-cosmetics')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
//                   <Palette className="text-orange-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium block text-sm sm:text-base">Change Cosmetics</span>
//                   <p className="text-xs text-gray-400 truncate">Update your style</p>
//                 </div>
//               </button>
//             </div>

//             {/* Special Daily Points Section */}
//             <div className="mb-6 relative">
//               <div className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400">
//                 <Star className="w-4 h-4 animate-pulse" />
//               </div>
//               <div className="absolute -top-1 -left-1 w-4 h-4 text-yellow-300">
//                 <Sparkles className="w-3 h-3 animate-pulse" style={{ animationDelay: '0.5s' }} />
//               </div>
              
//               <button
//                 onClick={() => handleSectionClick('daily-points')}
//                 className="relative block p-3 sm:p-4 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all group overflow-hidden w-full"
//               >
//                 <div className="absolute top-2 right-2">
//                   <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
//                     <Gift className="text-yellow-900 w-3 h-3 sm:w-4 sm:h-4" />
//                   </div>
//                 </div>
                
//                 <div className="flex items-center space-x-3">
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl flex items-center justify-center animate-bounce">
//                     <Coins className="text-yellow-900 w-5 h-5 sm:w-6 sm:h-6" />
//                   </div>
//                   <div className="text-left min-w-0 flex-1">
//                     <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
//                       Daily Rewards
//                     </span>
//                     <p className="text-xs text-yellow-300">Collect your bonus!</p>
//                   </div>
//                 </div>
                
//                 <div className="mt-2 flex items-center justify-between">
//                   <span className="text-xs text-yellow-200">+100 Points Available</span>
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
//                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
//                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
//                   </div>
//                 </div>
//               </button>
//             </div>

//             {/* Disconnect */}
//             <div className="pt-4 border-t border-gray-700">
//               <button
//                 onClick={() => handleSectionClick('disconnect')}
//                 className="w-full flex items-center space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-red-500/10 transition-colors group"
//               >
//                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
//                   <LogOut className="text-red-400 w-4 h-4 sm:w-5 sm:h-5" />
//                 </div>
//                 <div className="text-left min-w-0 flex-1">
//                   <span className="font-medium text-red-300 block text-sm sm:text-base">Disconnect</span>
//                   <p className="text-xs text-gray-400 truncate">Sign out safely</p>
//                 </div>
//               </button>
//             </div>
//           </nav>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="lg:ml-72 pt-20 min-h-screen bg-gray-900 transition-all duration-300">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          
//           {/* Welcome Section */}
//           <section 
//             className={`mb-8 sm:mb-12 cursor-pointer ${activeSection === 'welcome' ? 'ring-2 ring-blue-500' : ''}`}
//             onClick={() => handleSectionClick('welcome')}
//           >
//             <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-700">
//               <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
//                 <div>
//                   <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, Sarah!</h2>
//                   <p className="text-gray-400 text-base sm:text-lg">Ready to predict the future?</p>
//                 </div>
//                 <div className="text-left sm:text-right">
//                   <div className="text-xl sm:text-2xl font-bold text-yellow-400">2,450</div>
//                   <div className="text-sm text-gray-400">Total Points</div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Quick Stats */}
//           <section 
//             className={`mb-8 sm:mb-12 cursor-pointer ${activeSection === 'stats' ? 'ring-2 ring-blue-500' : ''}`}
//             onClick={() => handleSectionClick('stats')}
//           >
//             <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-center justify-between mb-2">
//                   <Eye className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6" />
//                   <span className="text-lg sm:text-2xl font-bold">24</span>
//                 </div>
//                 <p className="text-gray-400 text-xs sm:text-sm">Active Predictions</p>
//               </div>
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-center justify-between mb-2">
//                   <Trophy className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
//                   <span className="text-lg sm:text-2xl font-bold">87%</span>
//                 </div>
//                 <p className="text-gray-400 text-xs sm:text-sm">Accuracy Rate</p>
//               </div>
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-center justify-between mb-2">
//                   <Users className="text-green-400 w-5 h-5 sm:w-6 sm:h-6" />
//                   <span className="text-lg sm:text-2xl font-bold">156</span>
//                 </div>
//                 <p className="text-gray-400 text-xs sm:text-sm">Following</p>
//               </div>
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-center justify-between mb-2">
//                   <Flame className="text-red-400 w-5 h-5 sm:w-6 sm:h-6" />
//                   <span className="text-lg sm:text-2xl font-bold">12</span>
//                 </div>
//                 <p className="text-gray-400 text-xs sm:text-sm">Day Streak</p>
//               </div>
//             </div>
//           </section>

//           {/* Trending Predictions */}
//           <section 
//             className={`mb-8 sm:mb-12 cursor-pointer ${activeSection === 'trending' ? 'ring-2 ring-blue-500' : ''}`}
//             onClick={() => handleSectionClick('trending')}
//           >
//             <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Trending Predictions</h3>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
//                 <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
//                   <div className="flex items-center space-x-3 min-w-0 flex-1">
//                     <img 
//                       src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg" 
//                       alt="User" 
//                       className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
//                     />
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-sm sm:text-base line-clamp-2">Will AI replace 50% of jobs by 2030?</p>
//                       <p className="text-xs sm:text-sm text-gray-400">by TechGuru_Mike</p>
//                     </div>
//                   </div>
//                   <span className="bg-blue-500/20 text-blue-400 px-2 sm:px-3 py-1 rounded-full text-xs flex-shrink-0 self-start">
//                     Technology
//                   </span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
//                   <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-400">
//                     <span className="flex items-center">
//                       <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//                       1.2k votes
//                     </span>
//                     <span className="flex items-center">
//                       <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//                       89 comments
//                     </span>
//                   </div>
//                   <div className="text-left sm:text-right">
//                     <div className="text-base sm:text-lg font-bold text-green-400">Yes 67%</div>
//                     <div className="text-xs sm:text-sm text-gray-400">Ends in 5 days</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors">
//                 <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 space-y-3 sm:space-y-0">
//                   <div className="flex items-center space-x-3 min-w-0 flex-1">
//                     <img 
//                       src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg" 
//                       alt="User" 
//                       className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
//                     />
//                     <div className="min-w-0 flex-1">
//                       <p className="font-medium text-sm sm:text-base line-clamp-2">Bitcoin hits $100k before 2025?</p>
//                       <p className="text-xs sm:text-sm text-gray-400">by CryptoKing</p>
//                     </div>
//                   </div>
//                   <span className="bg-yellow-500/20 text-yellow-400 px-2 sm:px-3 py-1 rounded-full text-xs flex-shrink-0 self-start">
//                     Finance
//                   </span>
//                 </div>
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
//                   <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-400">
//                     <span className="flex items-center">
//                       <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//                       856 votes
//                     </span>
//                     <span className="flex items-center">
//                       <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
//                       124 comments
//                     </span>
//                   </div>
//                   <div className="text-left sm:text-right">
//                     <div className="text-base sm:text-lg font-bold text-red-400">No 58%</div>
//                     <div className="text-xs sm:text-sm text-gray-400">Ends in 12 days</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Recent Activity */}
//           <section 
//             className={`cursor-pointer ${activeSection === 'activity' ? 'ring-2 ring-blue-500' : ''}`}
//             onClick={() => handleSectionClick('activity')}
//           >
//             <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Recent Activity</h3>
//             <div className="space-y-3 sm:space-y-4">
//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-start space-x-3 sm:space-x-4">
//                   <img 
//                     src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg" 
//                     alt="User" 
//                     className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium mb-1 text-sm sm:text-base">
//                       You voted "Yes" on "Will SpaceX land on Mars by 2028?"
//                     </p>
//                     <p className="text-xs sm:text-sm text-gray-400">2 hours ago • +15 points earned</p>
//                   </div>
//                   <CheckSquare className="text-green-400 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
//                 </div>
//               </div>

//               <div className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700">
//                 <div className="flex items-start space-x-3 sm:space-x-4">
//                   <img 
//                     src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg" 
//                     alt="User" 
//                     className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex-shrink-0"
//                   />
//                   <div className="flex-1 min-w-0">
//                     <p className="font-medium mb-1 text-sm sm:text-base">
//                       Your prediction "Electric cars dominate by 2030" gained 50 new votes
//                     </p>
//                     <p className="text-xs sm:text-sm text-gray-400">5 hours ago • +25 points earned</p>
//                   </div>
//                   <TrendingUp className="text-blue-400 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
//                 </div>
//               </div>
//             </div>
//           </section>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;