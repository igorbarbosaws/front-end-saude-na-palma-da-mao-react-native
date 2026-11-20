// "Como você vai usar o TriaOrto?": escolha do perfil de acesso.
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarraTopo, Texto, Titulo, Tela } from "../../components/ui.js";
import { espaco, raio, useTema } from "../../theme.js";

const PERFIS = [
  { chave: "paciente", icone: "person-outline", titulo: "Sou paciente", desc: "Agendar consultas e acompanhar meu atendimento" },
  { chave: "profissional", icone: "medkit-outline", titulo: "Sou profissional de saúde", desc: "Gerenciar minha agenda e disponibilidade" },
  { chave: "administrador", icone: "shield-checkmark-outline", titulo: "Sou administrador", desc: "Gerenciar clínicas, profissionais e pacientes" },
];

export default function EscolherPerfil({ navigation }) {
  const c = useTema();
  return (
    <Tela>
      <BarraTopo titulo="Voltar" onVoltar={() => navigation.goBack()} />
      <Titulo>Como você vai usar o TriaOrto?</Titulo>
      <Texto suave style={{ marginBottom: espaco.g }}>Escolha o seu perfil de acesso</Texto>
      {PERFIS.map((p) => (
        <Pressable
          key={p.chave}
          accessibilityRole="button"
          accessibilityLabel={`${p.titulo}. ${p.desc}`}
          onPress={() => navigation.navigate("Login", { perfil: p.chave })}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", padding: espaco.m, marginBottom: espaco.m, borderRadius: raio,
            borderWidth: 1.5, borderColor: c.borda, backgroundColor: pressed ? c.primariaClara : c.superficie,
          })}
        >
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: c.primariaClara, alignItems: "center", justifyContent: "center", marginRight: espaco.m }}>
            <Ionicons name={p.icone} size={26} color={c.primariaEscura} />
          </View>
          <View style={{ flex: 1 }}>
            <Texto style={{ fontWeight: "700" }}>{p.titulo}</Texto>
            <Texto suave style={{ fontSize: 14, lineHeight: 20 }}>{p.desc}</Texto>
          </View>
          <Ionicons name="chevron-forward" size={22} color={c.textoSuave} />
        </Pressable>
      ))}
    </Tela>
  );
}
