#!/usr/bin/env ruby
# Fails when a key under _data/strings/en.yml is used but undefined, or
# defined but unused. Templates reach keys as site.data.strings.en.<a>.<b>,
# or through an alias set by `assign s = ...en` / `assign s = ...en.<a>`.
require "yaml"

def flatten(hash, prefix = nil)
  hash.flat_map do |k, v|
    key = [prefix, k].compact.join(".")
    v.is_a?(Hash) ? flatten(v, key) : [key]
  end
end

root = File.expand_path("..", __dir__)
defined = flatten(YAML.load_file(File.join(root, "_data/strings/en.yml")))
files = Dir.glob(File.join(root, "{_includes,_layouts}/**/*.{html,md}")) + Dir.glob(File.join(root, "*.{md,html}"))

used = []
files.each do |f|
  text = File.read(f)
  text.gsub(/assign\s+s\s*=[^%]*%}/, "").scan(/site\.data\.strings\.en\.([a-z_]+(?:\.[a-z_]+)*)/) { |m| used << m[0] }
  alias_prefix = text[/assign\s+s\s*=\s*site\.data\.strings\.en(?:\.([a-z_]+))?\s*-?%}/, 1]
  if text =~ /assign\s+s\s*=\s*site\.data\.strings\.en/
    text.scan(/\bs\.([a-z_]+(?:\.[a-z_]+)*)/) { |m| used << [alias_prefix, m[0]].compact.join(".") }
  end
end
# Category titles are looked up dynamically (s.categories[cat.id]), so count
# one key per category id in _data/skills.yml instead of the bare prefix.
used.delete("skills.categories")
YAML.load_file(File.join(root, "_data/skills.yml")).each { |c| used << "skills.categories.#{c['id']}" }
used.uniq!

missing = used - defined
unused = defined - used
puts "Used but undefined: #{missing.join(', ')}" unless missing.empty?
puts "Defined but unused: #{unused.join(', ')}" unless unused.empty?
exit(missing.empty? && unused.empty? ? 0 : 1)
