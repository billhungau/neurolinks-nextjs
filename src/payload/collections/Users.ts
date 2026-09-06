import type { CollectionConfig } from "payload";
import { authenticated } from "../access";

/**
 * CMS administrators. This is the only authentication collection, so it also
 * owns the `/admin/` login. `unlock` and `admin` are locked to signed-in
 * users so an authenticated editor cannot reset another account's lockout.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: {
    singular: "CMS user",
    plural: "CMS users",
  },
  admin: {
    group: "Administration",
    useAsTitle: "name",
    defaultColumns: ["name", "email", "updatedAt"],
    description:
      "People who can sign in to edit NeuroLinks Insights. Keep this list short.",
  },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    read: authenticated,
    create: authenticated,
    update: authenticated,
    delete: authenticated,
    unlock: authenticated,
    admin: authenticated,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      admin: {
        description: "Shown in the admin header and in version history.",
      },
    },
  ],
  timestamps: true,
};
