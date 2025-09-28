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
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      Capacidades: {
        Row: {
          IdCapacidad: string
          Nombre: string
        }
        Insert: {
          IdCapacidad?: string
          Nombre: string
        }
        Update: {
          IdCapacidad?: string
          Nombre?: string
        }
        Relationships: []
      }
      Ciclo: {
        Row: {
          Anticonceptivas: boolean | null
          DiaFinFolicular: string | null
          DiaFinLuteo: string | null
          DiaFinMenstruacion: string | null
          DiaFinPeriodo: string | null
          DiaInicioCiclo: string | null
          DiasCicloPremenstrualAnterior: number | null
          DiasDuracionCicloAnteriores: number | null
          DiasFolicular: number | null
          DiasLuteos: number | null
          DiasMenstrual: number | null
          DiasOvulatorios: number | null
          DiasPremenstruales: number | null
          DiasSangrado: number | null
          FecFinalizacionSangrado: string | null
          FechaInicioCiclo: string | null
          FecOvulacion: string | null
          IdCicloJugadora: string
          IdUsuario: string | null
          Ovulacion: number | null
        }
        Insert: {
          Anticonceptivas?: boolean | null
          DiaFinFolicular?: string | null
          DiaFinLuteo?: string | null
          DiaFinMenstruacion?: string | null
          DiaFinPeriodo?: string | null
          DiaInicioCiclo?: string | null
          DiasCicloPremenstrualAnterior?: number | null
          DiasDuracionCicloAnteriores?: number | null
          DiasFolicular?: number | null
          DiasLuteos?: number | null
          DiasMenstrual?: number | null
          DiasOvulatorios?: number | null
          DiasPremenstruales?: number | null
          DiasSangrado?: number | null
          FecFinalizacionSangrado?: string | null
          FechaInicioCiclo?: string | null
          FecOvulacion?: string | null
          IdCicloJugadora?: string
          IdUsuario?: string | null
          Ovulacion?: number | null
        }
        Update: {
          Anticonceptivas?: boolean | null
          DiaFinFolicular?: string | null
          DiaFinLuteo?: string | null
          DiaFinMenstruacion?: string | null
          DiaFinPeriodo?: string | null
          DiaInicioCiclo?: string | null
          DiasCicloPremenstrualAnterior?: number | null
          DiasDuracionCicloAnteriores?: number | null
          DiasFolicular?: number | null
          DiasLuteos?: number | null
          DiasMenstrual?: number | null
          DiasOvulatorios?: number | null
          DiasPremenstruales?: number | null
          DiasSangrado?: number | null
          FecFinalizacionSangrado?: string | null
          FechaInicioCiclo?: string | null
          FecOvulacion?: string | null
          IdCicloJugadora?: string
          IdUsuario?: string | null
          Ovulacion?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Ciclo_IdUsuario_fkey"
            columns: ["IdUsuario"]
            isOneToOne: false
            referencedRelation: "Jugadora"
            referencedColumns: ["IdJugadora"]
          },
        ]
      }
      Club: {
        Row: {
          IdClub: string
          NombreClub: string
          PaisClub: string
        }
        Insert: {
          IdClub?: string
          NombreClub: string
          PaisClub: string
        }
        Update: {
          IdClub?: string
          NombreClub?: string
          PaisClub?: string
        }
        Relationships: []
      }
      Jugadora: {
        Row: {
          Activa: boolean | null
          Apellido: string
          Division: string | null
          Edad: number | null
          Email: string
          IdClub: string | null
          IdJugadora: string
          Indicador: number | null
          Nombre: string
        }
        Insert: {
          Activa?: boolean | null
          Apellido: string
          Division?: string | null
          Edad?: number | null
          Email: string
          IdClub?: string | null
          IdJugadora: string
          Indicador?: number | null
          Nombre: string
        }
        Update: {
          Activa?: boolean | null
          Apellido?: string
          Division?: string | null
          Edad?: number | null
          Email?: string
          IdClub?: string | null
          IdJugadora?: string
          Indicador?: number | null
          Nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "Jugadora_IdClub_fkey"
            columns: ["IdClub"]
            isOneToOne: false
            referencedRelation: "Club"
            referencedColumns: ["IdClub"]
          },
        ]
      }
      PF: {
        Row: {
          Apellido: string
          Division: string | null
          Email: string
          IdClub: string | null
          IdUsuario: string
          Nombre: string
        }
        Insert: {
          Apellido: string
          Division?: string | null
          Email: string
          IdClub?: string | null
          IdUsuario: string
          Nombre: string
        }
        Update: {
          Apellido?: string
          Division?: string | null
          Email?: string
          IdClub?: string | null
          IdUsuario?: string
          Nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "PF_IdClub_fkey"
            columns: ["IdClub"]
            isOneToOne: false
            referencedRelation: "Club"
            referencedColumns: ["IdClub"]
          },
        ]
      }
      Subcapacidad: {
        Row: {
          IdCapacidad: string
          IdSubCapacidad: string
          Nombre: string
        }
        Insert: {
          IdCapacidad: string
          IdSubCapacidad?: string
          Nombre: string
        }
        Update: {
          IdCapacidad?: string
          IdSubCapacidad?: string
          Nombre?: string
        }
        Relationships: [
          {
            foreignKeyName: "Subcapacidad_IdCapacidad_fkey"
            columns: ["IdCapacidad"]
            isOneToOne: false
            referencedRelation: "Capacidades"
            referencedColumns: ["IdCapacidad"]
          },
        ]
      }
      TipoSemana: {
        Row: {
          Capacidad: string | null
          Division: string
          FechaCompetencia: string
          FechaEntrenamiento: string
          IdClub: string | null
          IdPF: string | null
          IdTipoSemana: string
          SubCapacidad: string | null
        }
        Insert: {
          Capacidad?: string | null
          Division: string
          FechaCompetencia: string
          FechaEntrenamiento: string
          IdClub?: string | null
          IdPF?: string | null
          IdTipoSemana?: string
          SubCapacidad?: string | null
        }
        Update: {
          Capacidad?: string | null
          Division?: string
          FechaCompetencia?: string
          FechaEntrenamiento?: string
          IdClub?: string | null
          IdPF?: string | null
          IdTipoSemana?: string
          SubCapacidad?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TipoSemana_Capacidad_fkey"
            columns: ["Capacidad"]
            isOneToOne: false
            referencedRelation: "Capacidades"
            referencedColumns: ["IdCapacidad"]
          },
          {
            foreignKeyName: "TipoSemana_IdClub_fkey"
            columns: ["IdClub"]
            isOneToOne: false
            referencedRelation: "Club"
            referencedColumns: ["IdClub"]
          },
          {
            foreignKeyName: "TipoSemana_IdPF_fkey"
            columns: ["IdPF"]
            isOneToOne: false
            referencedRelation: "PF"
            referencedColumns: ["IdUsuario"]
          },
          {
            foreignKeyName: "TipoSemana_SubCapacidad_fkey"
            columns: ["SubCapacidad"]
            isOneToOne: false
            referencedRelation: "Subcapacidad"
            referencedColumns: ["IdSubCapacidad"]
          },
        ]
      }
      Variables: {
        Row: {
          FechaCarga: string
          IdUsuario: string
          VariableA: number | null
          VariableB: number | null
          VariableC: number | null
          VariableD: number | null
          VariableE: number | null
        }
        Insert: {
          FechaCarga?: string
          IdUsuario?: string
          VariableA?: number | null
          VariableB?: number | null
          VariableC?: number | null
          VariableD?: number | null
          VariableE?: number | null
        }
        Update: {
          FechaCarga?: string
          IdUsuario?: string
          VariableA?: number | null
          VariableB?: number | null
          VariableC?: number | null
          VariableD?: number | null
          VariableE?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Variables_IdUsuario_fkey"
            columns: ["IdUsuario"]
            isOneToOne: false
            referencedRelation: "Jugadora"
            referencedColumns: ["IdJugadora"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
