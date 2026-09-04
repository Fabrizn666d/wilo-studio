import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: UserRole;
      sessionVersion: number;
    };
  }

  interface User {
    role: UserRole;
    sessionVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    sessionVersion?: number;
  }
}
