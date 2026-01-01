export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      award_rules: {
        Row: {
          autres_conditions: Json | null
          cautions_requises: number | null
          created_at: string
          credit_type_id: string
          delai_grace_max: number | null
          epargne_prealable: number | null
          garanties_acceptees: string[] | null
          id: string
          quotite_cessible: number | null
          ratio_couverture_garantie: number | null
        }
        Insert: {
          autres_conditions?: Json | null
          cautions_requises?: number | null
          created_at?: string
          credit_type_id: string
          delai_grace_max?: number | null
          epargne_prealable?: number | null
          garanties_acceptees?: string[] | null
          id?: string
          quotite_cessible?: number | null
          ratio_couverture_garantie?: number | null
        }
        Update: {
          autres_conditions?: Json | null
          cautions_requises?: number | null
          created_at?: string
          credit_type_id?: string
          delai_grace_max?: number | null
          epargne_prealable?: number | null
          garanties_acceptees?: string[] | null
          id?: string
          quotite_cessible?: number | null
          ratio_couverture_garantie?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "award_rules_credit_type_id_fkey"
            columns: ["credit_type_id"]
            isOneToOne: false
            referencedRelation: "credit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_type_history: {
        Row: {
          action: string
          created_at: string
          credit_type_id: string
          details: Json | null
          id: string
          motif: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          credit_type_id: string
          details?: Json | null
          id?: string
          motif?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          credit_type_id?: string
          details?: Json | null
          id?: string
          motif?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_type_history_credit_type_id_fkey"
            columns: ["credit_type_id"]
            isOneToOne: false
            referencedRelation: "credit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_types: {
        Row: {
          client_categories: Database["public"]["Enums"]["client_type"][]
          created_at: string
          created_by: string | null
          differe_max: number | null
          duree_max: number | null
          duree_min: number | null
          id: string
          libelle: string
          montant_max: number | null
          montant_min: number | null
          status: Database["public"]["Enums"]["credit_type_status"]
          taux_interet: number
          updated_at: string
        }
        Insert: {
          client_categories?: Database["public"]["Enums"]["client_type"][]
          created_at?: string
          created_by?: string | null
          differe_max?: number | null
          duree_max?: number | null
          duree_min?: number | null
          id?: string
          libelle: string
          montant_max?: number | null
          montant_min?: number | null
          status?: Database["public"]["Enums"]["credit_type_status"]
          taux_interet: number
          updated_at?: string
        }
        Update: {
          client_categories?: Database["public"]["Enums"]["client_type"][]
          created_at?: string
          created_by?: string | null
          differe_max?: number | null
          duree_max?: number | null
          duree_min?: number | null
          id?: string
          libelle?: string
          montant_max?: number | null
          montant_min?: number | null
          status?: Database["public"]["Enums"]["credit_type_status"]
          taux_interet?: number
          updated_at?: string
        }
        Relationships: []
      }
      dossier_history: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          dossier_id: string
          id: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          dossier_id: string
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          dossier_id?: string
          id?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dossier_history_dossier_id_fkey"
            columns: ["dossier_id"]
            isOneToOne: false
            referencedRelation: "dossiers"
            referencedColumns: ["id"]
          },
        ]
      }
      dossiers: {
        Row: {
          ai_recommendation: Json | null
          analysis_data: Json | null
          classe_risque: string | null
          client_id: string
          created_at: string
          credit_type_id: string | null
          differe: number | null
          duree: number
          garanties: Json | null
          gestionnaire_id: string | null
          gestionnaire_remarks: string | null
          id: string
          kyc_data: Json | null
          montant: number
          score_global: number | null
          status: Database["public"]["Enums"]["dossier_status"]
          updated_at: string
        }
        Insert: {
          ai_recommendation?: Json | null
          analysis_data?: Json | null
          classe_risque?: string | null
          client_id: string
          created_at?: string
          credit_type_id?: string | null
          differe?: number | null
          duree: number
          garanties?: Json | null
          gestionnaire_id?: string | null
          gestionnaire_remarks?: string | null
          id?: string
          kyc_data?: Json | null
          montant: number
          score_global?: number | null
          status?: Database["public"]["Enums"]["dossier_status"]
          updated_at?: string
        }
        Update: {
          ai_recommendation?: Json | null
          analysis_data?: Json | null
          classe_risque?: string | null
          client_id?: string
          created_at?: string
          credit_type_id?: string | null
          differe?: number | null
          duree?: number
          garanties?: Json | null
          gestionnaire_id?: string | null
          gestionnaire_remarks?: string | null
          id?: string
          kyc_data?: Json | null
          montant?: number
          score_global?: number | null
          status?: Database["public"]["Enums"]["dossier_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dossiers_credit_type_id_fkey"
            columns: ["credit_type_id"]
            isOneToOne: false
            referencedRelation: "credit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_rules: {
        Row: {
          age_max: number | null
          age_min: number | null
          anciennete_min: number | null
          autres_criteres: Json | null
          created_at: string
          credit_type_id: string
          id: string
          localisation: string | null
          revenus_min: number | null
          score_beac_min: number | null
          taux_endettement_max: number | null
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          anciennete_min?: number | null
          autres_criteres?: Json | null
          created_at?: string
          credit_type_id: string
          id?: string
          localisation?: string | null
          revenus_min?: number | null
          score_beac_min?: number | null
          taux_endettement_max?: number | null
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          anciennete_min?: number | null
          autres_criteres?: Json | null
          created_at?: string
          credit_type_id?: string
          id?: string
          localisation?: string | null
          revenus_min?: number | null
          score_beac_min?: number | null
          taux_endettement_max?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_rules_credit_type_id_fkey"
            columns: ["credit_type_id"]
            isOneToOne: false
            referencedRelation: "credit_types"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          client_type: Database["public"]["Enums"]["client_type"] | null
          created_at: string
          email: string | null
          id: string
          nom: string
          prenom: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          email?: string | null
          id?: string
          nom: string
          prenom: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          client_type?: Database["public"]["Enums"]["client_type"] | null
          created_at?: string
          email?: string | null
          id?: string
          nom?: string
          prenom?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      client_type: "salarie" | "independant" | "entreprise"
      credit_type_status: "actif" | "suspendu"
      dossier_status:
        | "en_cours"
        | "panier"
        | "analyse"
        | "transmis"
        | "approuve"
        | "refuse"
        | "classe"
      user_role: "admin" | "gestionnaire" | "client"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      client_type: ["salarie", "independant", "entreprise"],
      credit_type_status: ["actif", "suspendu"],
      dossier_status: [
        "en_cours",
        "panier",
        "analyse",
        "transmis",
        "approuve",
        "refuse",
        "classe",
      ],
      user_role: ["admin", "gestionnaire", "client"],
    },
  },
} as const
