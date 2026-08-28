import re
from typing import List
from app.rag.models import DocumentChunk

class TextChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        # Boundaries to try splitting on, in order of preference (paragraphs, sentences, characters)
        self.separators = ["\n\n", "\n", ". ", " ", ""]

    def split_text(self, text: str) -> List[DocumentChunk]:
        raw_chunks = self._split_recursive(text, self.separators)
        
        doc_chunks = []
        current_pos = 0
        
        for i, chunk_text in enumerate(raw_chunks):
            # Find the start_char by searching for the chunk_text from current_pos
            start_char = text.find(chunk_text, current_pos)
            if start_char == -1:
                # Fallback if somehow not found exactly
                start_char = current_pos
            
            end_char = start_char + len(chunk_text)
            
            doc_chunks.append(
                DocumentChunk(
                    chunk_index=i,
                    text=chunk_text,
                    start_char=start_char,
                    end_char=end_char
                )
            )
            # Update current_pos for the next search, taking overlap into account safely
            current_pos = max(start_char, start_char + len(chunk_text) - self.chunk_overlap)
            
        return doc_chunks

    def _split_recursive(self, text: str, separators: List[str]) -> List[str]:
        # Base case: if text is smaller than chunk size, return it
        if len(text) <= self.chunk_size:
            return [text]
            
        # Find the best separator
        separator = separators[-1] # fallback to ""
        for sep in separators:
            if sep == "":
                separator = sep
                break
            if sep in text:
                separator = sep
                break
                
        # Split by separator
        if separator:
            splits = text.split(separator)
        else:
            splits = list(text) # split by character
            
        # Merge splits into chunks with overlap
        chunks = []
        current_chunk = []
        current_length = 0
        
        for split in splits:
            split_len = len(split) if not separator else len(split) + len(separator)
            
            if current_length + split_len > self.chunk_size and current_length > 0:
                # Complete the current chunk
                joined_chunk = separator.join(current_chunk)
                chunks.append(joined_chunk)
                
                # Start new chunk with overlap
                overlap_length = 0
                new_chunk = []
                for prev_split in reversed(current_chunk):
                    prev_len = len(prev_split) if not separator else len(prev_split) + len(separator)
                    if overlap_length + prev_len > self.chunk_overlap and overlap_length > 0:
                        break
                    new_chunk.insert(0, prev_split)
                    overlap_length += prev_len
                    
                current_chunk = new_chunk
                current_length = overlap_length
                
            current_chunk.append(split)
            current_length += split_len
            
        if current_chunk:
            chunks.append(separator.join(current_chunk))
            
        # Refine chunks that are still too large
        final_chunks = []
        for chunk in chunks:
            if len(chunk) > self.chunk_size and len(separators) > 1:
                # Recursively split with the next separators
                next_separators = separators[separators.index(separator) + 1:]
                if next_separators:
                    final_chunks.extend(self._split_recursive(chunk, next_separators))
                else:
                    final_chunks.append(chunk)
            else:
                final_chunks.append(chunk)
                
        return final_chunks
