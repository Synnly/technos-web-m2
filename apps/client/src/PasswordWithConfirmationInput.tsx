import { type UseFormRegister, type UseFormWatch } from "react-hook-form";
import "./App.css";


interface PasswordWithConfirmationInputProps {
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
}

/**
 * Composant pour le champ de mot de passe et sa confirmation.
 * Ajoute des validations pour le mot de passe (longueur, majuscule, minuscule, chiffre, caractère spécial)
 * et vérifie que la confirmation du mot de passe correspond au mot de passe.
 * @param param0 Props contenant les fonctions de registre et de surveillance du formulaire.
 * @returns Le champ de mot de passe et sa confirmation.
 */
const PasswordWithConfirmationInput: React.FC<PasswordWithConfirmationInputProps> = ({ register, watch }) => {
    // Fonction de validation pour le mot de passe
    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Le mot de passe doit contenir au moins 8 caractères";
        }
        if (!/[A-Z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre majuscule";
        }
        if (!/[a-z]/.test(password)) {
            return "Le mot de passe doit contenir au moins une lettre minuscule";
        }
        if (!/[0-9]/.test(password)) {
            return "Le mot de passe doit contenir au moins un chiffre";
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            return "Le mot de passe doit contenir au moins un caractère spécial";
        }
        return true;
    };

    return (
        <>
            <input
                type="password"
                {...register("password", { 
                    required: "Champ requis",
                    validate: validatePassword
                })}
                placeholder="Mot de passe"
            />

            <input
                type="password"
                {...register("passwordConfirmation", { 
                    required: "Champ requis",
                    validate: (value) => {
                        const password = watch("password");
                        return value === password || "Les mots de passe ne correspondent pas";
                    }
                })}
                placeholder="Confirmation du mot de passe"
            />
        </>
    );
}

export default PasswordWithConfirmationInput;