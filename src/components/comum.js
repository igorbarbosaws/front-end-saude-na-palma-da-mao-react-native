// Peças visuais usadas em várias telas (lotes). Mexeu aqui? Avise o grupo e faça um PR pequeno.
import { Image, Modal, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ALVO_MINIMO, espaco, fonte, raio, useEscala, useTema } from "../theme.js";
import { Botao, Carregando, Texto } from "./ui.js";
import { iniciais } from "../core/profissionais.js";

// Cartão branco com borda. Se tiver onPress, vira um botão (toque inteiro).
export function Cartao({ children, onPress, style, rotuloAcessibilidade }) {
  const c = useTema();
  const base = { backgroundColor: c.superficie, borderRadius: raio, borderWidth: 1.5, borderColor: c.borda, padding: espaco.m, marginBottom: espaco.m };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={rotuloAcessibilidade} onPress={onPress}
      style={({ pressed }) => [base, { backgroundColor: pressed ? c.primariaClara : c.superficie }, style]}>
      {children}
    </Pressable>
  );
}

// Linha de lista: ícone redondo + título + descrição + seta. Usada em atalhos e menus.
export function LinhaItem({ icone, titulo, descricao, onPress, direita, tom }) {
  const c = useTema();
  const e = useEscala();
  const corIcone = tom === "perigo" ? c.erro : c.primariaEscura;
  return (
    <Cartao onPress={onPress} rotuloAcessibilidade={descricao ? `${titulo}. ${descricao}` : titulo} style={{ flexDirection: "row", alignItems: "center" }}>
      {!!icone && (
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: tom === "perigo" ? c.erroFundo : c.primariaClara, alignItems: "center", justifyContent: "center", marginRight: espaco.m }}>
          <Ionicons name={icone} size={22} color={corIcone} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ color: tom === "perigo" ? c.erro : c.texto, fontSize: fonte.corpo * e, fontWeight: "700" }}>{titulo}</Text>
        {!!descricao && <Text style={{ color: c.textoSuave, fontSize: fonte.pequena * e, marginTop: 2 }}>{descricao}</Text>}
      </View>
      {direita ?? (onPress ? <Ionicons name="chevron-forward" size={20} color={c.textoSuave} /> : null)}
    </Cartao>
  );
}

// Estado vazio ("Nenhuma consulta ainda").
export function Vazio({ icone = "file-tray-outline", texto }) {
  const c = useTema();
  return (
    <View style={{ alignItems: "center", padding: espaco.g }}>
      <Ionicons name={icone} size={44} color={c.textoSuave} />
      <Texto suave style={{ textAlign: "center", marginTop: espaco.p }}>{texto}</Texto>
    </View>
  );
}

// Erro de carregamento com botão "Tentar novamente".
export function ErroTela({ mensagem, onTentar }) {
  const c = useTema();
  return (
    <View style={{ padding: espaco.m, alignItems: "stretch" }}>
      <View style={{ backgroundColor: c.erroFundo, borderRadius: raio, padding: espaco.m, marginBottom: espaco.m }}>
        <Text accessibilityRole="alert" style={{ color: c.erro, fontSize: fonte.corpo }}>{mensagem}</Text>
      </View>
      {onTentar && <Botao titulo="Tentar novamente" variante="contorno" onPress={onTentar} />}
    </View>
  );
}

// Atalho para o padrão de toda tela de lista: carregando -> erro -> vazio -> conteúdo.
//   <Estado carregando={carregando} erro={erro} onTentar={recarregar} vazio={lista?.length === 0} textoVazio="...">{conteúdo}</Estado>
export function Estado({ carregando, erro, onTentar, vazio, textoVazio, iconeVazio, children }) {
  if (carregando) return <Carregando />;
  if (erro) return <ErroTela mensagem={erro} onTentar={onTentar} />;
  if (vazio) return <Vazio texto={textoVazio} icone={iconeVazio} />;
  return children;
}

// Selo pequeno de status. tom: "sucesso" | "aviso" | "erro" | "neutro"
export function Selo({ texto, tom = "neutro" }) {
  const c = useTema();
  const e = useEscala();
  const paleta = { sucesso: [c.sucessoFundo, c.sucesso], aviso: [c.avisoFundo, c.aviso], erro: [c.erroFundo, c.erro], neutro: [c.primariaClara, c.primariaEscura] }[tom];
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: paleta[0], borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text style={{ color: paleta[1], fontSize: fonte.pequena * e, fontWeight: "700" }}>{texto}</Text>
    </View>
  );
}

// Opção selecionável (filtros, horários, especialidades).
export function Chip({ rotulo, ativo, onPress, desabilitado }) {
  const c = useTema();
  const e = useEscala();
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: !!ativo, disabled: !!desabilitado }} disabled={desabilitado} onPress={onPress}
      style={{
        minHeight: ALVO_MINIMO - 4, paddingHorizontal: 16, justifyContent: "center", borderRadius: 24, borderWidth: 1.5, marginRight: 8, marginBottom: 8,
        borderColor: ativo ? c.primaria : c.borda, backgroundColor: ativo ? c.primaria : c.superficie, opacity: desabilitado ? 0.5 : 1,
      }}>
      <Text style={{ color: ativo ? c.sobrePrimaria : c.texto, fontSize: fonte.pequena * e + 1, fontWeight: "600" }}>{rotulo}</Text>
    </Pressable>
  );
}

// Círculo com as iniciais do profissional (uma cor por pessoa, como no design).
const CORES = ["#0f7a6d", "#7c3aed", "#b45309", "#db2777", "#0369a1"];
export function Avatar({ nome, id = 1, tamanho = 48 }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ width: tamanho, height: tamanho, borderRadius: tamanho / 2, backgroundColor: CORES[Math.abs((Number(id) || 1) - 1) % CORES.length], alignItems: "center", justifyContent: "center" }}>
      <Text style={{ color: "#fff", fontWeight: "700", fontSize: tamanho * 0.36 }}>{iniciais(nome)}</Text>
    </View>
  );
}

export function Secao({ titulo, children }) {
  const c = useTema();
  const e = useEscala();
  return (
    <View style={{ marginBottom: espaco.m }}>
      <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo * e, fontWeight: "700", marginBottom: espaco.p }}>{titulo}</Text>
      {children}
    </View>
  );
}

// Confirmação em janela (no lugar do window.confirm do web).
//   <Confirmar visivel={x} titulo="Cancelar consulta?" mensagem="..." textoOk="Cancelar" perigo onConfirmar={fn} onCancelar={() => setX(false)} />
export function Confirmar({ visivel, titulo, mensagem, textoOk = "Confirmar", textoVoltar = "Voltar", perigo, ocupado, onConfirmar, onCancelar }) {
  const c = useTema();
  return (
    <Modal visible={!!visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: espaco.m }}>
        <View accessibilityViewIsModal style={{ backgroundColor: c.superficie, borderRadius: raio, padding: espaco.g }}>
          <Text accessibilityRole="header" style={{ color: c.texto, fontSize: fonte.subtitulo, fontWeight: "700", marginBottom: espaco.p }}>{titulo}</Text>
          {!!mensagem && <Texto suave style={{ marginBottom: espaco.m }}>{mensagem}</Texto>}
          <Botao titulo={textoOk} variante={perigo ? "perigo" : "cheio"} ocupado={ocupado} onPress={onConfirmar} style={{ marginBottom: espaco.p }} />
          <Botao titulo={textoVoltar} variante="contorno" desabilitado={ocupado} onPress={onCancelar} />
        </View>
      </View>
    </Modal>
  );
}

export const FotoLogo = ({ tamanho = 32 }) => <Image source={require("../../assets/logo.png")} style={{ width: tamanho, height: tamanho }} accessibilityIgnoresInvertColors />;
