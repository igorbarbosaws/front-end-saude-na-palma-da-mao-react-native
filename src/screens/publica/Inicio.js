// Tela inicial: marca, lema e botões Entrar / Cadastrar.
import { Image, StyleSheet, View, useColorScheme } from "react-native";
import { Botao, Texto, Tela } from "../../components/ui.js";
import { espaco, useTema } from "../../theme.js";

export default function Inicio({ navigation }) {
  const c = useTema();
  const escuro = useColorScheme() === "dark";
  return (
    <Tela contentStyle={{ justifyContent: "space-between" }}>
      <View style={estilos.marca}>
        <Image source={require("../../../assets/logo.png")} style={estilos.logo} accessibilityIgnoresInvertColors />
        <Image
          source={escuro ? require("../../../assets/wordmark-escuro.png") : require("../../../assets/wordmark.png")}
          style={estilos.palavra}
          resizeMode="contain"
          accessibilityLabel="TriaOrto+"
        />
        <Texto suave style={{ textAlign: "center", marginTop: espaco.p }}>Ortopedia e Fisioterapia Ortopédica</Texto>
      </View>

      <View>
        <View style={[estilos.traco, { backgroundColor: c.realce }]} />
        <Texto style={{ textAlign: "center", fontSize: 22, fontWeight: "600", marginBottom: espaco.g }}>Cuidar começa por entender.</Texto>
        <Botao titulo="Entrar" onPress={() => navigation.navigate("EscolherPerfil")} style={{ marginBottom: espaco.m }} />
        <Botao titulo="Cadastrar" variante="contorno" onPress={() => navigation.navigate("Cadastro")} />
      </View>

      <Image source={require("../../../assets/ilustracao.png")} style={estilos.ilustracao} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Tela>
  );
}

const estilos = StyleSheet.create({
  marca: { alignItems: "center", marginTop: espaco.gg },
  logo: { width: 64, height: 64 },
  palavra: { width: 168, height: 29, marginTop: espaco.m },
  traco: { height: 3, width: 48, alignSelf: "center", borderRadius: 2, marginVertical: espaco.g },
  ilustracao: { width: "100%", height: 116, marginTop: espaco.g },
});
