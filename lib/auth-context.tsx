import React, { useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  isLogged: boolean;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    account
      .get()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log("Auth Session Check Error:", error.message);
        setIsLogged(false);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      return await signIn(email, password);
    } catch (error: any) {
      console.error("Sign Up Error:", error.message);
      return error.message;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      setUser(user);
      setIsLogged(true);
      return null;
    } catch (error: any) {
      return error.message;
    }
  };

  const signOut = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setIsLogged(false);
    } catch (error: any) {
      console.error("Sign Out Error:", error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLogged, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
