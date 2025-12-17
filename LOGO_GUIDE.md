# 🎨 Como Adicionar sua Logo

## 📝 Instruções:

### 1. **Converta Icon.jpg para PNG**

Use um conversor online ou comando:
```bash
# Se tiver ImageMagick instalado
convert Icon.jpg public/images/logo.png

# Ou use um site como:
# https://convertio.co/jpg-png/
# https://cloudconvert.com/jpg-to-png
```

### 2. **Coloque a logo no lugar certo**

```bash
# Mova o arquivo para:
public/images/logo.png
```

**Tamanho recomendado:** 512x512px ou 1024x1024px (quadrado)

### 3. **A logo já está integrada!**

O componente `Logo.tsx` já está configurado para usar `/images/logo.png`

## 🎯 Onde a Logo Aparece:

### **1. Navbar** (Topo de todas as páginas)
- Logo + texto "Capelo Club"
- Animação de hover (cresce levemente)
- Clicável para voltar ao dashboard

### **2. Favicon** (Aba do navegador)
Adicione também em:
```
public/favicon.ico
app/icon.png (Next.js 13+)
```

### **3. Splash Screen** (Opcional)
Use `LogoSplash` para tela de loading:
```tsx
import { LogoSplash } from '@/components/Logo'

<LogoSplash />
```

### **4. Login/Registro**
Adicione a logo nas páginas de auth

## 🎨 Variantes do Componente:

### **Logo Completo** (com texto)
```tsx
import Logo from '@/components/Logo'

<Logo size="md" showText animated />
```

### **Apenas Ícone**
```tsx
import { LogoIcon } from '@/components/Logo'

<LogoIcon size={40} animated />
```

### **Splash/Loading**
```tsx
import { LogoSplash } from '@/components/Logo'

<LogoSplash />
```

## ⚙️ Opções de Customização:

### **Tamanhos:**
- `sm` - 24px (mobile, sidebar)
- `md` - 32px (navbar padrão)
- `lg` - 48px (hero, landing)

### **Com/Sem Texto:**
```tsx
<Logo showText={true} />  // Logo + "Capelo Club"
<Logo showText={false} /> // Apenas logo
```

### **Com/Sem Animação:**
```tsx
<Logo animated={true} />  // Hover effect
<Logo animated={false} /> // Estático
```

## 🚀 Próximos Passos:

1. ✅ Converta Icon.jpg para PNG
2. ✅ Coloque em `public/images/logo.png`
3. ✅ Recarregue a página
4. ✅ Veja a logo no navbar!

## 📱 Favicon (Ícone da Aba):

Crie também:
```
public/favicon.ico (16x16, 32x32)
app/icon.png (512x512)
app/apple-icon.png (180x180)
```

## 🎨 Dicas de Design:

- **Fundo transparente** - Use PNG com alpha
- **Bordas limpas** - Evite bordas pixeladas
- **Contraste** - Funcione em dark/light mode
- **Simplicidade** - Legível em tamanhos pequenos

## 🔧 Troubleshooting:

**Logo não aparece?**
- Verifique se o arquivo está em `public/images/logo.png`
- Limpe o cache: Ctrl+Shift+R
- Verifique o console por erros

**Logo pixelada?**
- Use imagem maior (mínimo 512x512)
- Formato PNG com boa qualidade
- Evite JPG (perde qualidade)

**Logo muito grande/pequena?**
- Ajuste o `size` prop: `sm`, `md`, `lg`
- Ou customize: `<LogoIcon size={64} />`

## 🎉 Resultado:

Sua logo vai aparecer:
- ✨ Animada no hover
- 🎯 Clicável para dashboard
- 📱 Responsiva
- 🌙 Funciona em dark mode
- ⚡ Otimizada (Next.js Image)

**Adicione a logo e veja a mágica acontecer!** 🚀
