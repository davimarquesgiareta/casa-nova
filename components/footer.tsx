// components/footer.tsx
"use client"

export function Footer() {
  return (
    <footer className="w-full border-t border-border p-4 mt-8">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Todos os direitos reservados a Davi Marques Giareta
      </div>
    </footer>
  );
}