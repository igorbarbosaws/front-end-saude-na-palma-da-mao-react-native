import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AcessibilidadeProvider } from "./src/core/acessibilidade.js";
import { SessaoProvider } from "./src/navigation/SessaoContext.js";
import Navegacao from "./src/navigation/index.js";

export default function App() {
  return (
    <SafeAreaProvider>
      <AcessibilidadeProvider>
        <SessaoProvider>
          <Navegacao />
          <StatusBar style="auto" />
        </SessaoProvider>
      </AcessibilidadeProvider>
    </SafeAreaProvider>
  );
}
