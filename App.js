import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessaoProvider } from "./src/navigation/SessaoContext.js";
import Navegacao from "./src/navigation/index.js";

export default function App() {
  return (
    <SafeAreaProvider>
      <SessaoProvider>
        <Navegacao />
        <StatusBar style="auto" />
      </SessaoProvider>
    </SafeAreaProvider>
  );
}
