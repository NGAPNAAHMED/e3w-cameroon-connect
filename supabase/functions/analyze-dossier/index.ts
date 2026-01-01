import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientData {
  id: string;
  nom: string;
  prenom: string;
  type: 'salarie' | 'independant' | 'entreprise';
  revenus: number;
  charges: number;
  anciennete: number;
  age?: number;
  secteur?: string;
  localisation?: string;
  epargne?: number;
}

interface CreditData {
  montant: number;
  duree: number;
  differe: number;
  typeCredit: string;
  tauxInteret: number;
  mensualite: number;
}

interface GarantieData {
  type: string;
  valeurEstimee: number;
  description?: string;
}

interface HistoriqueCredit {
  encoursBancaire: number;
  encoursBEAC: number;
  impayesActuels: number;
  retardMaxHistorique: number;
  tauxRegularisation: number;
  nombreCreditsActifs: number;
}

interface AnalysisRequest {
  client: ClientData;
  credit: CreditData;
  garanties: GarantieData[];
  historique: HistoriqueCredit;
  reglesEligibilite?: any;
  reglesOctroi?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { client, credit, garanties, historique, reglesEligibilite, reglesOctroi }: AnalysisRequest = await req.json();

    console.log("Analyzing dossier for client:", client.nom, client.prenom);

    // Calculate key ratios
    const capaciteRemboursement = client.revenus - client.charges;
    const debtServiceRatio = credit.mensualite > 0 ? (credit.mensualite / capaciteRemboursement) * 100 : 0;
    const totalGaranties = garanties.reduce((sum, g) => sum + g.valeurEstimee, 0);
    const couvertureGarantie = credit.montant > 0 ? (totalGaranties / credit.montant) * 100 : 0;
    const ratioEncours = client.revenus > 0 ? (historique.encoursBancaire + historique.encoursBEAC) / (client.revenus * 12) : 0;

    // Build analysis prompt
    const systemPrompt = `Tu es un expert analyste crédit pour une institution de microfinance en zone CEMAC/COBAC. 
Tu dois analyser un dossier de demande de crédit et fournir:
1. Un score global sur 100
2. Une classe de risque (A, B, C, D)
3. Une recommandation (ACCORD, ACCORD SOUS CONDITIONS, AJOURNEMENT, REFUS)
4. Une analyse détaillée par dimension
5. Les facteurs positifs et négatifs
6. Des recommandations spécifiques

Sois précis, professionnel et conforme aux normes COBAC.`;

    const analysisPrompt = `
DOSSIER DE DEMANDE DE CRÉDIT

=== IDENTIFICATION CLIENT ===
- Nom: ${client.nom} ${client.prenom}
- Type: ${client.type}
- Secteur: ${client.secteur || 'Non spécifié'}
- Localisation: ${client.localisation || 'Non spécifiée'}
- Ancienneté: ${client.anciennete} mois
- Âge: ${client.age || 'Non spécifié'} ans

=== SITUATION FINANCIÈRE ===
- Revenus mensuels: ${client.revenus.toLocaleString('fr-FR')} FCFA
- Charges mensuelles: ${client.charges.toLocaleString('fr-FR')} FCFA
- Capacité disponible: ${capaciteRemboursement.toLocaleString('fr-FR')} FCFA
- Épargne: ${(client.epargne || 0).toLocaleString('fr-FR')} FCFA

=== CRÉDIT DEMANDÉ ===
- Type: ${credit.typeCredit}
- Montant: ${credit.montant.toLocaleString('fr-FR')} FCFA
- Durée: ${credit.duree} mois
- Différé: ${credit.differe} mois
- Taux d'intérêt: ${credit.tauxInteret}%
- Mensualité estimée: ${credit.mensualite.toLocaleString('fr-FR')} FCFA

=== RATIOS CLÉS ===
- Debt Service Ratio (DSR): ${debtServiceRatio.toFixed(1)}% (seuil recommandé ≤ 40%)
- Couverture garantie: ${couvertureGarantie.toFixed(1)}% (seuil recommandé ≥ 100%)
- Ratio encours/revenus annuels: ${ratioEncours.toFixed(2)}

=== HISTORIQUE DE CRÉDIT ===
- Encours bancaire: ${historique.encoursBancaire.toLocaleString('fr-FR')} FCFA
- Encours BEAC: ${historique.encoursBEAC.toLocaleString('fr-FR')} FCFA
- Impayés actuels: ${historique.impayesActuels.toLocaleString('fr-FR')} FCFA
- Retard max historique: ${historique.retardMaxHistorique} jours
- Taux de régularisation: ${historique.tauxRegularisation}%
- Crédits actifs: ${historique.nombreCreditsActifs}

=== GARANTIES PROPOSÉES ===
${garanties.length > 0 ? garanties.map((g, i) => `${i + 1}. ${g.type}: ${g.valeurEstimee.toLocaleString('fr-FR')} FCFA${g.description ? ` - ${g.description}` : ''}`).join('\n') : 'Aucune garantie proposée'}
- Total garanties: ${totalGaranties.toLocaleString('fr-FR')} FCFA

Fournis ton analyse au format JSON avec la structure suivante:
{
  "scoreGlobal": number (0-100),
  "classeRisque": "A" | "B" | "C" | "D",
  "recommendation": "ACCORD" | "ACCORD_SOUS_CONDITIONS" | "AJOURNEMENT" | "REFUS",
  "scores": {
    "capaciteFinanciere": number (0-100),
    "disciplineHistorique": number (0-100),
    "endettement": number (0-100),
    "garanties": number (0-100),
    "contexteActivite": number (0-100),
    "stabilite": number (0-100)
  },
  "indicateurs": [
    {"nom": string, "valeur": string, "seuil": string, "statut": "vert" | "orange" | "rouge"}
  ],
  "facteursPositifs": [string],
  "facteursNegatifs": [string],
  "conditionsSuggerees": [string],
  "analyseDetaille": string,
  "resumeExecutif": string,
  "conformiteCOBAC": {
    "plafondsRespectés": boolean,
    "documentationComplete": boolean,
    "derogationsRequises": boolean,
    "commentaires": string
  }
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, veuillez réessayer plus tard." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants pour l'analyse IA." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      analysis = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      // Return a default analysis
      analysis = {
        scoreGlobal: 50,
        classeRisque: "C",
        recommendation: "AJOURNEMENT",
        scores: {
          capaciteFinanciere: 50,
          disciplineHistorique: 60,
          endettement: 50,
          garanties: 40,
          contexteActivite: 50,
          stabilite: 50
        },
        indicateurs: [
          { nom: "DSR", valeur: `${debtServiceRatio.toFixed(1)}%`, seuil: "≤ 40%", statut: debtServiceRatio <= 40 ? "vert" : "rouge" },
          { nom: "Couverture garantie", valeur: `${couvertureGarantie.toFixed(1)}%`, seuil: "≥ 100%", statut: couvertureGarantie >= 100 ? "vert" : "rouge" }
        ],
        facteursPositifs: ["Analyse en cours"],
        facteursNegatifs: ["Données insuffisantes pour analyse complète"],
        conditionsSuggerees: ["Compléter le dossier"],
        analyseDetaille: "Analyse automatique en attente de données complètes.",
        resumeExecutif: "Dossier nécessitant une revue manuelle.",
        conformiteCOBAC: {
          plafondsRespectés: true,
          documentationComplete: false,
          derogationsRequises: false,
          commentaires: "À vérifier"
        }
      };
    }

    console.log("Analysis completed with score:", analysis.scoreGlobal);

    return new Response(JSON.stringify({
      success: true,
      analysis,
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-dossier function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Erreur lors de l'analyse" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
