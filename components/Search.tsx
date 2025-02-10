"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getFiles } from "@/actions/file.action";
import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { useDebounce } from "use-debounce";

const Search = () => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [result, setResult] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const [debounceQuery] = useDebounce(query, 500);
  useEffect(() => {
    const fetchFiles = async () => {
      if (debounceQuery.length === 0) {
        setResult([]);
        setOpen(false);
        return router.push(path.replace(searchParams.toString(), ""));
      }
      const file = await getFiles({ types: [], searchText: debounceQuery });
      setResult(file.documents);
      setOpen(true);
    };
    fetchFiles();
  }, [debounceQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const router = useRouter();
  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResult([]);
    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`,
    );
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="Search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="search-input"
        />
        {open && (
          <ul className="search-result">
            {result.length > 0 ? (
              result.map((file) => (
                <li
                  key={file.$id}
                  className="flex items-center justify-between"
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      type={file.type}
                      extension={file.extension}
                      url={file.url}
                      className="size-9 min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>
                  <FormattedDateTime
                    date={file.$createdAt}
                    className="caption line-clamp-1 text-light-200"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No file found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
export default Search;
